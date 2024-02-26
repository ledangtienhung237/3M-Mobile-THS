

        let searchResults = []; // Array to store search results
        let currentSuggestions = []; // Array to store current suggestions
        let allData = []; // Variable to store all data

        const sheetId = '1z78L-ekU5Lk-F3b4VHhKS3b1lEYmbbG9bUjmG4ss6Zc'; // Replace 'YOUR_SHEET_ID' with your actual sheet ID
        const apiKey = 'AIzaSyCC44a5q3PVMDLMNHKkeNU6LmLDM9vxdL8'; // Replace 'YOUR_API_KEY' with your actual API key

        const maxSuggestions = 10; // Maximum number of suggestions to display

        function fetchData() {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Trang tính1?key=${apiKey}`;
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch data');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Data from Google Sheets:', data);
                    // Store all data except header row
                    allData = data.values.slice(1);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }

        // Call fetchData function when the page loads
        window.onload = function() {
            fetchData();
            // Refresh data periodically (every 5 minutes)
            setInterval(fetchData, 5 * 60 * 1000);
        };

        // Function to suggest goods based on user input
        function suggestGoods() {
            const input = document.getElementById('searchInput').value.trim().toLowerCase(); // Trim whitespace from input and convert to lowercase

            // Show the dropdown only if there are suggestions and input is not empty
            const dropdown = document.getElementById('suggestionsDropdown');
            dropdown.style.display = currentSuggestions.length === 0 || input === '' ? 'none' : 'block';

            if (input === '') {
                dropdown.innerHTML = ''; // Clear dropdown if input is empty
                return;
            }

            // Search for suggestions based on index [1]
            const suggestions = allData.filter(row => row[1].toLowerCase().includes(input)).map(row => row[1]);
            currentSuggestions = suggestions.slice(0, maxSuggestions);
            displaySuggestions(currentSuggestions); // Display the suggestions in dropdown
        }

        // Function to display suggestions in dropdown
        function displaySuggestions(suggestions) {
            const dropdown = document.getElementById('suggestionsDropdown');
            dropdown.innerHTML = ''; // Clear previous suggestions
            if (suggestions.length > 0) {
                dropdown.style.display = 'block';
                suggestions.forEach(suggestion => {
                    const option = document.createElement('option');
                    option.value = suggestion;
                    option.textContent = suggestion; // Set the content of the option
                    dropdown.appendChild(option);

                    // Add click event listener to each suggestion
                    option.addEventListener('click', function() {
                        // Set the value of the search input to the selected suggestion
                        document.getElementById('searchInput').value = suggestion;
                        // Hide the suggestions dropdown
                        dropdown.style.display = 'none';
                    });
                });

                // Adjust the height of the dropdown to fit all suggestions
                dropdown.size = suggestions.length;
            } else {
                dropdown.style.display = 'none';
            }
        }

        // Add event listener to input field to suggest goods when typing
        document.getElementById('searchInput').addEventListener('input', suggestGoods);

        // Add event listener to form submission to handle search
        document.getElementById('searchForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission
            search(); // Call the search function
        });

            // Function to perform search based on user input
        function search() {
            const inputElement = document.getElementById('searchInput');
            const input = inputElement.value.trim().toLowerCase(); // Trim whitespace from input and convert to lowercase

            console.log('Searching for:', input);

            // Search for the input in index [1] (name column)
            const result = allData.find(row => row[1].toLowerCase().includes(input));

            if (result) {
                // If result found, display stock information
                displayStockInfo(result);
            } else {
                // If result not found, display message
                document.getElementById('stock-info').textContent = 'Không tìm thấy hàng.';
            }

            // Hide the dropdown after search
            document.getElementById('suggestionsDropdown').style.display = 'none';

            // Clear the search box
            inputElement.value = '';
        }


       // Function to display stock information
            function displayStockInfo(result) {
                const [code, name, quantity, price, unit, expireDate] = result;
                const stockInfoContainer = document.getElementById('stock-info');
                stockInfoContainer.innerHTML = ''; // Clear previous content

                // Create a div element to contain the stock information
                const stockInfoDiv = document.createElement('div');
                stockInfoDiv.classList.add('stock-info');

                // Create paragraph elements for each piece of information
                const namePara = document.createElement('p');
                namePara.innerHTML = `<strong class="name">${name}</strong>`; // Bold name
                stockInfoDiv.appendChild(namePara);

                const pricePara = document.createElement('p');
                pricePara.innerHTML = ` <span class="price ${quantity > 0 ? 'small-text' : 'small-text red-text'}">${price}</span>`; // Downsize price and color based on stock
                stockInfoDiv.appendChild(pricePara);

                const quantityPara = document.createElement('p');
                quantityPara.innerHTML = `<strong class="${quantity > 0 ? 'small-text blue-text' : 'small-text red-text'}">Tồn:</strong> <span class="quantity small-text">${quantity}</span>`; // Downsize quantity and color based on stock
                stockInfoDiv.appendChild(quantityPara);

                const expireDatePara = document.createElement('p');
                expireDatePara.innerHTML = `<strong class="small-text">Date:</strong> <span class="expire-date small-text">${expireDate}</span>`; // Downsize expiration date
                stockInfoDiv.appendChild(expireDatePara);

                // Create a span element for the plus symbol
                const plusSymbol = document.createElement('span');
                plusSymbol.textContent = '+';
                plusSymbol.classList.add('plus-symbol');
                plusSymbol.addEventListener('click', function() {
                    // Here you can implement the logic to add the item to the cart
                    addToCart(result);
                });
                stockInfoDiv.appendChild(plusSymbol);

                // Create a span element for the minus symbol
                const minusSymbol = document.createElement('span');
                minusSymbol.textContent = '-';
                minusSymbol.classList.add('minus-symbol');
                minusSymbol.addEventListener('click', function() {
                    // Here you can implement the logic to remove the item from the cart
                    removeFromCart(result);
                });
                stockInfoDiv.appendChild(minusSymbol);

                // Append the stockInfoDiv to the stockInfoContainer
                stockInfoContainer.appendChild(stockInfoDiv);

                stockInfoContainer.style.display = 'block'; // Show the stock info container
            }


        
        let cartItems = []; // Mảng để lưu trữ các mặt hàng trong giỏ hàng

                    // Function to add an item to the cart
            function addToCart(item) {
                // Check if the item already exists in the cart
                const existingItemIndex = cartItems.findIndex(cartItem => cartItem.name === item[1]);

                if (existingItemIndex !== -1) {
                    // If the item exists, increment its quantity
                    cartItems[existingItemIndex].quantity += 1;
                } else {
                    // If the item doesn't exist, add it with a quantity of 1
                    const cartItem = {
                        name: item[1],          // Use index 1 for name
                        price: item[3],         // Use index 3 for price
                        expireDate: item[5],    // Use index 5 for expiration date
                        quantity: 1             // Default quantity set to 1
                    };
                    // Push the modified cart item to the cartItems array
                    cartItems.push(cartItem);
                }
                // Update the cart display
                updateCartDisplay();
            }


        
                        // Function to remove an item from the cart
            function removeFromCart(item) {
                // Find the index of the item in the cartItems array
                const index = cartItems.findIndex(cartItem => cartItem.name === item[1]);
                
                if (index !== -1) {
                    // Decrease the quantity of the item by 1
                    cartItems[index].quantity -= 1;
                    
                    // If quantity reaches zero, remove the item from the cart
                    if (cartItems[index].quantity === 0) {
                        cartItems.splice(index, 1);
                    }
                }
                
                // Update the cart display
                updateCartDisplay();
            }

            
            function updateCartDisplay() {
                const cartDisplay = document.getElementById('cart-items');
                if (!cartDisplay) {
                    console.error("Element with id 'cart-items' not found.");
                    return;
                }
                cartDisplay.innerHTML = ''; // Clear previous content
            
                // Loop through each item in the cartItems array
                cartItems.forEach(item => {
                    // Create a div element to contain cart item details
                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.classList.add('cart-item');
            
                    // Create paragraph elements for each piece of information
                    const namePara = document.createElement('p');
                    namePara.textContent = `Name: ${item.name}`;
                    cartItemDiv.appendChild(namePara);
            
                    const pricePara = document.createElement('p');
                    pricePara.textContent = `Price: ${item.price}`;
                    cartItemDiv.appendChild(pricePara);
            
                    const expireDatePara = document.createElement('p');
                    expireDatePara.textContent = `Expire Date: ${item.expireDate}`;
                    cartItemDiv.appendChild(expireDatePara);
            
                    // Create a div to contain quantity label and input box
                    const quantityContainer = document.createElement('div');
                    quantityContainer.classList.add('quantity-container');
            
                    // Create a label for the quantity input
                    const quantityLabel = document.createElement('label');
                    quantityLabel.textContent = 'Số lượng:';
                    quantityLabel.classList.add('quantity-label');
                    quantityContainer.appendChild(quantityLabel);
            
                    // Create an input box for adjusting the quantity
                    const quantityInput = document.createElement('input');
                    quantityInput.type = 'number';
                    quantityInput.value = item.quantity;
                    quantityInput.min = '1'; // Minimum quantity allowed
                    quantityInput.classList.add('quantity-input'); // Apply CSS class
                    quantityInput.addEventListener('change', function(event) {
                        const newQuantity = parseInt(event.target.value);
                        if (!isNaN(newQuantity) && newQuantity >= 1) {
                            item.quantity = newQuantity;
                            updateCartDisplay(); // Update the cart display after changing quantity
                        } else {
                            // Reset the input value if an invalid quantity is entered
                            event.target.value = item.quantity;
                        }
                    });
                    quantityContainer.appendChild(quantityInput);
            
                    // Append the quantityContainer to the cartItemDiv
                    cartItemDiv.appendChild(quantityContainer);
            
                    // Append the cartItemDiv to the cartDisplay
                    cartDisplay.appendChild(cartItemDiv);
                });
            
                // Show the cart display container
                cartDisplay.style.display = 'block';
            }
            
            // Add event listener to order button
            document.getElementById('order-button').addEventListener('click', function() {
                // Place your order logic here
                console.log('Order placed!');
            });
            
            
            
            


// Hàm để lấy chi tiết mặt hàng từ phần tử hiển thị mặt hàng
function getItemDetails(stockInfoElement) {
    const name = stockInfoElement.querySelector('.name').textContent;
    const quantity = parseInt(stockInfoElement.querySelector('.quantity').textContent);
    const price = parseFloat(stockInfoElement.querySelector('.price').textContent);
    const expireDate = stockInfoElement.querySelector('.expire-date').textContent;
    return { name, quantity, price, expireDate };
}



document.addEventListener('DOMContentLoaded', function() {
    // Call the updateCartDisplay function here
    updateCartDisplay();
});
document.getElementById('order-button').addEventListener('click', function() {
    // Serialize cart data as JSON and encode it as a URL parameter
    const cartData = encodeURIComponent(JSON.stringify(cartItems));
    // Redirect to the order confirmation page with cart data as a parameter
    window.location.href = `order_confirmation.html?cartData=${cartData}`;
});

