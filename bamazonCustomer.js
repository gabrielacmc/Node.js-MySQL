var inquirer = require("inquirer");
var mysql = require('mysql');

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
    showProducts();
});

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
                res[i].price
            )
        }

        buy();

    });
}

function buy() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Which item code would you like to buy?",
                name: "action",
            },
            {
                type: "input",
                message: "How many items would you like to buy?",
                name: "quanity",
            },
        ])
        .then(function (inquirerResponse) {

            connection.query("SELECT stock_quantity, price FROM products WHERE ?",
                {
                    id: inquirerResponse.action
                }
                , function (err, res) {
                    if (err) throw err;
                    if (inquirerResponse.quanity > res[0].stock_quantity) {
                        console.log("Insufficient quantity!")
                    }
                    else {
                        console.log("Processing Order!")
                        var newQuantity = res[0].stock_quantity - parseFloat(inquirerResponse.quanity)
                        var total = parseFloat(inquirerResponse.quanity) * res[0].price;
                        var query = connection.query(
                            "UPDATE products SET ? WHERE ?",
                            [
                                {
                                    stock_quantity: newQuantity,
                                    product_sales: total
                                },
                                {
                                    id: inquirerResponse.action,
                                },
                            ],
                            function (err, res) { }
                        )
                        console.log("Total order: $" + total);

                    }
                    buy();
                })
        })
}

