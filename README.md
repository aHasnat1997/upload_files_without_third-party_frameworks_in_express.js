## Upload files to Express Server without any third-party package

### 👉 Steps to run the application locally :
- Clone this repo on your system.
- Run this command in the terminal. ```npm install```
- Run this command to run the development version. ```npm run dev```

### 👉 Upload files:
- Set request method to POST and enter the endpoint :
 ```http://localhost:3000/fileUpload``` 
- Select "form-data" as the body type.
- Add a key-value pair with the file to upload. The key should be ```file```
- Select image or pdf or any file in value.
- Then make the request.
- File store under ("./uploads") in root.