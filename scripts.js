<!-- Add your scripts here -->

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

            // Append the stockInfoDiv to the stockInfoContainer
            stockInfoContainer.appendChild(stockInfoDiv);

            stockInfoContainer.style.display = 'block'; // Show the stock info container
        }
 
