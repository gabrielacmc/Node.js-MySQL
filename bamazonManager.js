var inquirer = require("inquirer");
var mysql = require('mysql');

var products_sale = "View Products for sale"
var view_inventory = "View low Inventory"
var add_inventory = "Add to Inventory"
var add_product = "New Product"

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'bamazon_db'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});

function start() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: [products_sale, view_inventory, add_inventory, add_product],
                name: "action",
            },
        ])
        .then(function (inquirerResponse) {
            if (inquirerResponse.action === products_sale) {
                showProducts();
            }
            else if (inquirerResponse.action === view_inventory) {
                showInventory();
            }
            else if (inquirerResponse.action === add_inventory) {
                addInventory();
            }
            else if (inquirerResponse.action === add_product) {
                addProduct();
            }

        })
}

function showProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(
                "\nProduct Code: " +
                res[i].id +
                " Product: " +
                res[i].product_name +
                " Price: $" +
                res[i].price +
                " Stock: " +
                res[i].stock_quantity
            )
        }
    })
    start();
}

function showInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(
                "\nProduct Code: " +
                res[i].id +
                " Product: " +
                res[i].product_name +
                " Price: $" +
                res[i].price +
                " Stock: " +
                res[i].stock_quantity +
                "\n_____________________\n"
            )
        }
        start();
    })
    
};

function addInventory() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Which item code would you like to replenish?",
                name: "action",
            },
            {
                type: "input",
                message: "How many items would you like to add?",
                name: "quanity",
            },
        ])
        .then(function (inquirerResponse) {

            connection.query("SELECT stock_quantity, price FROM products WHERE ?",
                {
                    id: inquirerResponse.action
                }
                , function (err, res) {

                    var newQuantity = res[0].stock_quantity + parseFloat(inquirerResponse.quanity)
                    var query = connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: newQuantity
                            },
                            {
                                id: inquirerResponse.action
                            }
                        ],
                        function (err, res) {
                            console.log("\nStock has been updated\n")
                        }

                    )



                })
                start();
        })
        
};

function addProduct() {
    inquirer
    .prompt([
        {
            type: "input",
            message: "Product to insert",
            name: "name",
        },
        {
            type: "input",
            message: "Department this product belongs to",
            name: "department",
        },
        {
            type: "input",
            message: "Price of product",
            name: "price",
        },
        {
            type: "input",
            message: "Stock of product",
            name: "stock",
        },
    ])
        .then(function (newProduct) {
            
            
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: newProduct.name,
                    department_name: newProduct.department,
                    price: parseFloat(newProduct.price),
                    stock_quantity: parseFloat(newProduct.stock),
                },
                function (err, res) {
                    console.log(newProduct.name + " inserted!\n");
                    // Call updateProduct AFTER the INSERT completes

                  
                }
            );
            start();
        })
      
}


