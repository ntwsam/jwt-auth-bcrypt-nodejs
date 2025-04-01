# JWT-Auth-Bcrypt-Node.js
This is basic **CRUD** API written in **node.js** using **JavaScript** with the **Express** framework, which connects to **MySQL** ( relational database ) and use **JWT**(Jsonwebtoken), **Bcrypt** to hashed password and use **authenticate middleware**

## Table of Contents

 - [How to install](##How%20to%20install)
 - [Requirement](##Requirement)
 - [How to run](##How%20to%20use)

## How to install

``` bash
git clone https://github.com/ntwsam/jwt-auth-bcrypt-nodejs.git
```

## Requirement
- **Node.js**
 - **Postman** or tool for testing HTTP
 - **MySQL**
 - **Visual Studio Code** (VScode) or other IDE
 
 ## How to run
 
 1. Run project with **VSCode**

	 - Open folder this project or Use **Command Prompt** select this project
		 - Click on **File > Open Folder...**  and select this project folder
		 - or Use **Command Prompt**
			``` bash
			cd nodejs-passportjs-session 
			code .
			```
	 - Open **Terminal** in VSCode
		- Click on **Terminal** ( on the top of menu bar)
		- Choose **New Terminal** or use the shortcut`Ctrl + Shift + ~` (Windows) or `Cmd + Shift + ~` (Mac) to oepn a terminal in VSCode.
	 - run this project
		- use `npm start` :
			``` bash
			npm start
			```
		 - use `nodemon run dev` : will automatically restart the server when you make changes to the files.
			``` bash
			nodemon run dev
			```
	- Verify the project
		- after running either `npm start` or `nodemon run dev`, you application will start and you can open your web browser and go to `http://localhost:3000` ( or whatever URL your server run on) to see the result.
2. It will automatically create database and table for using this project
	- **Table example** : password will collect by using **hashedpassword**
		|id|id|email|password|
		|--|------|------|-----------|
		 | 1 | 1| test@example.com| $2b$10$cktcNq.U2zxxNxeejQllguymNxu6TzLY7knDJbOsC5c2uLVhxvw6a
		| 2 | 2| new@example.com| $2b$10$cktcNq.A8llyNgdfgDFGRERG54xu6TzLY7knDJbOsC5c2uLcZww7f
3. Testing Http with **Postman**
	- **Register**
		-  use `post` and `localhost:3000/register` to get register new user
		- **require request body**
			- email
			- password
	- **Login**
		- use `post` and `localhost:3000/login` to logging in user
		- generate **access token** and **refresh token**
		- set **refresh token** in mock-up variable
		- set **access token** to header "Authorization"
		-  **require request body**
			- email
			- password
	- **Logout**
		- use `post` and `localhost:3000/logout` to logging out
		- remove **access token** in header "Authorization"
		- add **access token** to blacklisted mock-up
		- remove **refresh token** in mock-up variable
		- using **authenticate middleware** for checking
	- **Refresh**
		- use `post` and `localhost:3000/refresh` to refresh **access token** and **refresh token** ( rotation )
		- generate **new access token** and **new refresh token**
		- set **new access token** to header "Authorization"
		- set **new refresh token** in mock-up variable
		- using **authenticate middleware** for checking
	- **Protect**
		-  use `get` and `localhost:3000/protect` to check **authentication**
		- using **authenticate middleware** for checking
