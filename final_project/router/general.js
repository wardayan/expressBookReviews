const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

let get_books = new Promise((resolve, reject) => {
    try {
        resolve(JSON.stringify(books, null, 4));
    } catch (err) {
        reject(err);
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    get_books.then(
        (data) => res.send(data),
        (err) => res.send("Error getting book information")
    )
});

function get_book_ISBN (isbn) {
    let promise = new Promise((resolve, reject) => {
        try {
            resolve(books[isbn]);
        } catch (err) {
            reject(err);
        }
    })

    return promise;
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    get_book_ISBN(isbn).then(
        (data) => res.send(data),
        (err) => res.send("Error getting book")
    )
 });
  
function get_book_author (author) {
    let promise = new Promise((resolve, reject) => {
        try {
            let valid_books = {};
            for (const [key, value] of Object.entries(books)) {
                if (value.author === author) {
                    valid_books[key] = value;            
                } 
            }
            resolve(valid_books);

        } catch (err) {
            reject(err);
        }
    });

    return promise;
}

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    get_book_author(author).then(
        (data) => res.send(data),
        (err) => res.send("Error getting book")
    )
});

function get_book_title (title) {
    let promise = new Promise((resolve, reject) => {
        try {
            let valid_books = {};
            for (const [key, value] of Object.entries(books)) {
                if (value.title === title) {
                    valid_books[key] = value;            
                } 
            }
            resolve(valid_books);
        
        } catch (err) {
            reject(err);
        }
    });

    return promise;
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    get_book_title(title).then(
        (data) => res.send(data),
        (err) => res.send("Error getting book")
    )
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
