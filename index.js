const express = require("express")
const jwt = require('jsonwebtoken')
const cors = require('cors')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

const app = express()

app.use(express.json())
app.use(cors())

require('dotenv').config()

// ⭐️ create pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
})

// ⭐️ create database and table if no exists
const db = process.env.MYSQL_DATABASE;

(async () => {
    try {
        const connection = await pool.getConnection()
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``) // ⭐️ create database if no exists
        //console.log('Create database successfully!')

        await connection.query(`USE \`${db}\``)

        const table = `
        CREATE TABLE IF NOT EXISTS users(
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) UNIQUE NOT NULL);`
        await connection.query(table)   // ⭐️ create table if no exists
        //console.log('Create table successfully!')

        console.log('Connect to MySQL successfully!')

        connection.release()
        // pool.end()
    } catch (err) {
        console.log('Error to connect MySQL:', err)
    }
})()

// ⭐️ create mock-up for keep token
let refreshTokenMockUp = ''
let blacklistTokenMockUp = []

// ⭐️ create access token
function createAccessToken(user) {
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    return token
}

// ⭐️ create refresh token
function createRefreshToken(user) {
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' })
    return token
}

// ⭐️ auth middleware
const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization")
    if (!authHeader) {
        return res.status(403).json({ message: "User not log in" })
    }
    const token = authHeader && authHeader.split(" ")[1]
    if (!token) {
        return res.status(403).json({ message: "Token is required or expired" })
    }
    if (blacklistTokenMockUp.includes(token)) {
        return res.status(403).json({ message: "Token is blacklisted" })
    }
    if (token == "undefined") {
        return res.status(403).json({ message: "User not log in" })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" })
        }
        req.user = user
        next()
    })
}

// ⭐️ register
const register = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }
        const [existingEmail] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
        if (existingEmail.length > 0) {
            return res.status(400).json({ message: "Email is already used" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await pool.query("INSERT INTO users (email,password) VALUE (?,?)", [email, hashedPassword])
        res.status(201).json({
            message: "Create new user successfully!"
        })
    } catch (err) {
        res.status(500).json({ message: "Error to register new user:", err })
    }
}

// ⭐️ login
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }
        const [result] = await pool.query("SELECT * FROM users WHERE email = ?", email)
        const user = result[0] // ⭐️ because result is array
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return res.status(401).json({ message: '⚠️ Invalid credentials' })
        }
        access_token = await createAccessToken(user)
        refresh_token = await createRefreshToken(user)
        refreshTokenMockUp = refresh_token // ⭐️ keep refresh token mock-up
        res.setHeader('Authorization', 'Bearer ' + access_token)

        res.status(200).json({
            message: "Login Successfully!",
            refreshToken: refresh_token
        })
    } catch (err) {
        return res.status(500).json({ message: "Error to login:", err })
    }
}

// ⭐️ logout
const logout = async (req, res) => {
    try {
        const accessToken = req.header('Authorization')
        if (!accessToken) {
            return res.status(403).json({ message: "User not login" })
        }
        const token = accessToken && accessToken.split(" ")[1]
        blacklistTokenMockUp.push(token) // ⭐️ keep old access token mock-up
        refreshTokenMockUp = "" // ⭐️ delete refresh token mock-up
        res.removeHeader('Authorization');
        res.status(200).json({ message: "Log out successfully" })
    } catch (err) {
        return res.status(500).json({ message: "Error to logout:", err })
    }
}

// ⭐️ refreshToken
const refreshToken = async (req, res) => {
    try {
        if (!refreshTokenMockUp) {
            return res.status(401).json({ message: "Refresh token is required" })
        }
        jwt.verify(refreshTokenMockUp, process.env.REFRESH_JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Token is invalid" })
            }
            const access_token = createAccessToken(user)
            const refresh_token = createRefreshToken(user)
            res.setHeader('Authorization', 'Bearer ' + access_token)
            refreshTokenMockUp = refresh_token
            res.status(200).json({
                message: "Refresh token successfully",
                refreshToken: refreshTokenMockUp,
            })
        })
    } catch (err) {
        return res.status(500).json({ message: "Error to logout:", err })
    }
}

// ⭐️ protect
const protect = async (req, res) => {
    try {
        const userId = req.user.id
        const result = await pool.query("SELECT * FROM users WHERE id = ?", [userId])
        const user = result[0]
        res.status(200).json({
            message: "Protect route accessed",
            user: user
        })
    } catch (err) {
        return res.status(500).json({ message: "Error in the protected route:", err })
    }
}

// ⭐️ routes
app.post('/register', register)
app.post('/login', login)
app.post('/logout', authenticate, logout) // ⭐️ use middleware
app.post('/refresh', authenticate, refreshToken) // ⭐️ use middleware
app.get('/protect', authenticate, protect) // ⭐️ use middleware

app.get('/', (req, res) => {
    res.send("Hello,world")
})

const port = 3000
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
})