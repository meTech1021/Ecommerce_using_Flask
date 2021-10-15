FROM python:3.9.5
ADD . /code
WORKDIR /code
RUN python3 -m pip install --upgrade pip
RUN pip install -r requirements.txt
CMD python app.py