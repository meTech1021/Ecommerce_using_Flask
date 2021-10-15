from flask import g, Flask, render_template, redirect, request, session, url_for, flash, jsonify, Response
from flask_pymongo import PyMongo
from datetime import datetime
from flask_bcrypt import Bcrypt
from bson import json_util, ObjectId
from functools import wraps

app = Flask(__name__)
app.secret_key = 'BAD_SECRET_KEY'
mongodb_client = PyMongo(app, uri="mongodb://localhost:27017/DSPharmacy")
db = mongodb_client.db
bcrypt = Bcrypt()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('login'))
    return decorated_function

def is_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session['role'] == 'administrator':
            return f(*args, **kwargs)
        else:
            return redirect('/')
    return decorated_function

@app.route('/')
def index():
    print(session)
    if session:
        if session['role'] == 'administrator':
            return redirect('/admin/users')
        else:
            return redirect('/home')
    else:
        return redirect('/login')

@app.route('/login')
def login():
    return render_template('auth/login.html')

@app.route('/register')
def register():
    return render_template('auth/register.html')

@app.route('/signup', methods=['POST'])
def signup():
    username = request.values.get('r_name')
    email = request.values.get('r_email')
    ssn = request.values.get('ssn')
    usernames = db.users.find({'username' : username})
    emails = db.users.find({'email' : email})
    ssns = db.users.find({'ssn' : ssn})
    if usernames.count() == 0 and emails.count() == 0 and ssns.count() == 0:
        password = request.values.get('r_password')
        hash_pwd = bcrypt.generate_password_hash(password)
        date = datetime.now()
        db.users.insert_one({'username' : username, 'email' : email, 'password' : hash_pwd, 'ssn' : ssn, 'role' : 'user', 'created_at' : date})
        session['username'] = username
        session['email'] = email
        session['ssn'] = ssn
        session['password'] = hash_pwd
        session['shopping_cart'] = []
        session['role'] = 'user'
        return redirect('/')
    else:
        flash('Your User Name, E-mail or SSN already exists !')
        return redirect(url_for('register'))

@app.route('/signin', methods=['POST'])
def signin():
    username = request.values.get('name')
    password = request.values.get('password')
    user = db.users.find_one({'username' : username})
    if user:
        correct_pwd = bcrypt.check_password_hash(user['password'], password)
        if correct_pwd:
            session['username'] = user['username']
            session['email'] = user['email']
            session['ssn'] = user['ssn']
            session['password'] = user['password']
            session['role'] = user['role']
            session['shopping_cart'] = []
            return redirect('/')
        else:
            flash('Your password is incorrect. Please enter again.')
            return redirect(url_for('login'))
    else:
        user = db.users.find_one({'email' : username})
        if user:
            correct_pwd = bcrypt.check_password_hash(user['password'], password)
            if correct_pwd:
                session['username'] = user['username']
                session['email'] = user['email']
                session['ssn'] = user['ssn']
                session['password'] = user['password']
                session['role'] = user['role']
                session['shopping_cart'] = []
                return redirect('/')
            else:
                flash('Your password is incorrect. Please enter again.')
                return redirect(url_for('login'))
        else:
            flash("Your User Name or E-mail doesn't exist. Please enter again.")
            return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/home')
def home():
    categories = db.categories.find()
    products = db.products.find()
    print(products)
    return render_template('pages/shop.html', categories = categories, products = products)

@app.route('/add_cart', methods=['POST'])
def add_cart():
    product_name = request.values.get('product_name')
    price = request.values.get('price')
    amount = request.values.get('amount')
    category = request.values.get('category')
    product_id = request.values.get('product_id')
    product = {
        'id' : product_id,
        'product_name' : product_name,
        'price' : price,
        'amount' : amount,
        'category' : category
    }
    # session['shopping_cart'] = []
    
    shopping_cart = session['shopping_cart']
    shopping_cart.append(product)
    session['shopping_cart'] = shopping_cart
    print(session['shopping_cart'])
    return jsonify(shopping_cart = session['shopping_cart'])

@app.route('/my_cart', methods=['GET'])
def my_cart():
    return jsonify(my_cart = session['shopping_cart'])

@app.route('/cart_cancel', methods=['POST'])
def cart_cancel():
    cart_id = request.values.get('cart_id')
    cart_id = int(cart_id)
    price = session['shopping_cart'][cart_id]['price']
    amount = session['shopping_cart'][cart_id]['amount']
    price = int(price)
    amount = int(amount)
    cart_price = price * amount
    del session['shopping_cart'][cart_id]
    session['shopping_cart'] = session['shopping_cart']
    print(session['shopping_cart'])

    return jsonify(cart_price = cart_price)

@app.route('/buy', methods=['POST'])
def buy():
    for product in session['shopping_cart']:
        old_product = db.products.find_one({'_id' : ObjectId(product['id'])})
        old_product['stock'] = int(old_product['stock']) - int(product['amount'])
        db.products.update_one({'_id' : ObjectId(product['id'])}, { "$set" : {
            'stock' : old_product['stock']
        }})
    date = datetime.now()
    db.order_histories.insert_one({ 'username' : session['username'], 'order' : session['shopping_cart'], 'created_at' : date})
    session['shopping_cart'] = []
    return 'success'

@app.route('/order_history')
def order_history():
    orders = db.order_histories.find({'username' : session['username']})
    order_array = []
    for item in orders:
        total_price = 0
        for order in item['order']:
            total_price += int(order['price']) * int(order['amount'])
        new_order = {
            'id' : item['_id'],
            'order' : item['order'],
            'total_price' : total_price,
            'created_at' : str(item['created_at'])
        }
        order_array.append(new_order)
        print(order_array[0]['created_at'])
    
    return render_template('pages/order_history.html', orders = order_array)

@app.route('/order_detail', methods=['GET'])
def order_detail():
    order_id = request.values.get('order_id')
    order = db.order_histories.find_one({'_id' : ObjectId(order_id)})
    order = order['order']
    print(order)

    return jsonify(order = order)

@app.route('/shop/get_product', methods = ['POST'])
def get_products():
    products = db.products.find()

    products_array = []
    for p in products:
        product = {
            'id' : str(ObjectId(p['_id'])),
            'name' : p['name'],
            'category' : p['category'],
            'stock' : p['stock'],
            'price' : p['price'],
            'description' : p['description']
        }
        products_array.append(product)
    
    return jsonify(products = products_array)

@app.route('/admin/users')
@login_required
@is_admin
def users():
    users = db.users.find()
    return render_template('pages/admin/users.html', users = users)

@app.route('/admin/user/change_permission', methods = ['POST'])
def change_permission():
    user_id = request.values.get('user_id')
    state = request.values.get('state')
    db.users.update_one({'_id' : ObjectId(user_id)}, {
        "$set" : {
            'role' : state
        }
    })

    return 'changed'

@app.route('/admin/user/delete', methods=['POST'])
def user_delete():
    user_id = request.values.get('user_id')
    db.users.delete_one({'_id' : ObjectId(user_id)})

    return 'deleted'

@app.route('/admin/products')
@login_required
@is_admin
def products():
    products = db.products.find()
    categories = db.categories.find()
    return render_template('pages/admin/products.html', products = products, categories = categories)

@app.route('/admin/product/save', methods=['POST'])
def product_save():
    product_name = request.values.get('product_name')
    category = request.values.get('category')
    stock = request.values.get('stock')
    price = request.values.get('price')
    description = request.values.get('description')
    product_id = request.values.get('product_id')
    print(product_id)
    if product_id == '':
        db.products.insert_one({
            'name' : product_name,
            'category' : category,
            'price' : price,
            'stock' : stock,
            'description' : description
        })
    else:
        db.products.update_one({'_id' : ObjectId(product_id)}, { "$set" : {
            'name' : product_name,
            'category' : category,
            'price' : price,
            'stock' : stock,
            'description' : description
        }})

    return redirect('/admin/products')

@app.route('/admin/product/get', methods=['POST'])
def product_get():
    product_id = request.values.get('product_id')
    product = db.products.find_one({'_id' : ObjectId(product_id)})
    product = {
        'name' : product['name'],
        'category' : product['category'],
        'stock' : product['stock'],
        'price' : product['price'],
        'description' : product['description']
    }
    return jsonify(product = product)

@app.route('/admin/product/delete', methods=['POST'])
def product_delete():
    product_id = request.values.get('product_id')
    db.products.delete_one({'_id' : ObjectId(product_id)})
    return 'deleted'

@app.route('/admin/categories')
@login_required
@is_admin
def categories():
    categories = db.categories.find()
    return render_template('pages/admin/categories.html', categories = categories)

@app.route('/admin/category/save', methods=['POST'])
def category_save():
    category_name = request.values.get('category_name')
    category_id = request.values.get('cat_id')
    print(category_id)
    if category_id == 'undefined':
        category = db.categories.insert_one({'name' : category_name})
    else:
        print(category_name)
        category = db.categories.update_one({'_id' : ObjectId(category_id)}, {"$set" : {'name' : category_name}})
    return redirect('/admin/categories')

@app.route('/admin/category/delete', methods=['POST'])
def category_delete():
    category_id = request.values.get('category_id')
    db.categories.delete_one({'_id' : ObjectId(category_id)})
    return 'deleted'
