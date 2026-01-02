document.addEventListener('DOMContentLoaded', loadOrdersPage);

        document.getElementById('shipping').addEventListener('change', function() {
            const textbox = document.getElementById('addressTextBox');
            if (this.checked) {
                textbox.removeAttribute('readonly'); // Make the text box writable
            } else {
                textbox.setAttribute('readonly', true); // Make the text box readonly
            }
        });

        const orderOptions = document.getElementById('orderOptions');
        document.getElementById('ShawarmaCheckBox').addEventListener('change', function () {
            if (this.checked) {
                orderOptions.style.display = 'block'; // Show the group
            } else {
                orderOptions.style.display = 'none'; // Hide the group
            }
        });

        const drinksOptions = document.getElementById('drinksOptions');
        document.getElementById('drinksCheckBox').addEventListener('change', function () {
            if (this.checked) {
                drinksOptions.style.display = 'block'; // Show the group
            } else {
                drinksOptions.style.display = 'none'; // Hide the group
                const checkboxes = document.querySelectorAll('#drinksCheckBox, #drinksOptions input[type="radio"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false; // Uncheck each checkbox
                });
            }
            updatePrice();
        });

        const sidesOptions = document.getElementById('sidesOptions');
        document.getElementById('sidesCheckBox').addEventListener('change', function () {
            if (this.checked) {
                sidesOptions.style.display = 'block'; // Show the group
            } else {
                sidesOptions.style.display = 'none'; // Hide the group
                const checkboxes = document.querySelectorAll('#sidesCheckBox, #sidesOptions input[type="radio"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false; // Uncheck each checkbox
                });
            }
            updatePrice();
        });

        const wrappingOptions = document.getElementById('wrappingOptions');
        document.getElementById('ShawarmaCheckBox').addEventListener('change', function () {
            if (this.checked) {
                wrappingOptions.style.display = 'block'; // Show the group
            } else {
                wrappingOptions.style.display = 'none'; // Hide the group
                const checkboxes = document.querySelectorAll('#ShawarmaCheckBox, #wrappingOptions input[type="radio"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false; // Uncheck each checkbox
                });
            }
            updatePrice();
        });


        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
        import { getDatabase, push, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDloIOJSWp_5lVtoNBIE5XrdTJgbCpNGjo",
            authDomain: "test-655b0.firebaseapp.com",
            databaseURL: "https://test-655b0-default-rtdb.firebaseio.com",
            projectId: "test-655b0",
            storageBucket: "test-655b0.firebasestorage.app",
            messagingSenderId: "948260428804",
            appId: "1:948260428804:web:78f1ea2db14800c5b42951"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase();

        const shippingCheckbox = document.getElementById("shipping");

        let orders = [];


        function updateShippingFee(){
            let overallPrice = parseInt(document.getElementById('overallPrice').textContent ,10)
            let shippingFee = parseInt(shippingCheckbox.dataset.price, 10);
            if(shippingCheckbox.checked){
                document.getElementById('shippingFee').textContent = shippingCheckbox.dataset.price;
                overallPrice += shippingFee;
            }
            else{
                document.getElementById('shippingFee').textContent = 0;
                overallPrice -= shippingFee;
            }
            document.getElementById('overallPrice').textContent = overallPrice;
        }

        // Load the order page, check if the shop is open or closed
        function loadOrdersPage() {
            const configRef = ref(db, "config/");
            get(configRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const config = snapshot.val();
                    const isShopOpen = config.is_shop_open;

                    if (isShopOpen) {
                        document.getElementById("order-page").style.display = "block";
                        document.getElementById("closed-page").style.display = "none";
                    } else {
                        document.getElementById("order-page").style.display = "none";
                        document.getElementById("closed-page").style.display = "block";
                    }
                }
            }).catch((error) => {
                console.error("Error loading shop status:", error);
            });
        }


        const addOrderBtn = document.querySelector("#addOrderBtn");
        const sendOrderBtn = document.querySelector("#sendOrderBtn");

        addOrderBtn.addEventListener('click', addOrder);
        sendOrderBtn.addEventListener('click', sendOrders);
        shippingCheckbox.addEventListener('click', updateShippingFee);


        const checkboxes = document.querySelectorAll('#wrappingOptions input[type="radio"], #sidesOptions input[type="radio"], #drinksOptions input[type="radio"]');
        checkboxes.forEach(checkbox => checkbox.addEventListener('change', updatePrice));

        function updatePrice() {
            const selectedOptions = Array.from(document.querySelectorAll('#wrappingOptions input[type="radio"]:checked, #sidesOptions input[type="radio"]:checked, #drinksOptions input[type="radio"]:checked'));
            var price = selectedOptions.reduce((total, option) => {
                return total + parseInt(option.dataset.price, 10);
            }, 0);

            // full meal discount
            const isShawarmaChecked = document.querySelector('input[name="Shawarma"]').checked;
            const issidesChecked = document.querySelector('input[name="sides"]').checked;
            const isDrinkChecked = document.querySelector('input[name="drinks"]').checked;
            var drinks = Array.from(document.querySelectorAll('input[name="drinkOption"]:checked')).map(option => option.value);
            var sides = Array.from(document.querySelectorAll('input[name="sideOption"]:checked')).map(option => option.value);


            const discount = 5;
        
            if (isShawarmaChecked && (issidesChecked && sides.length) && (isDrinkChecked && drinks.length)) {
                price -= discount;
            }

            document.getElementById('price').textContent = price;
        }

        function updateOrderReview() {
            const orderReviewList = document.getElementById("orderReviewList");
            orderReviewList.innerHTML = '';
            let overallPrice = 0;
            let orderNumber = 1;
            orders.forEach((order, index) => {
                overallPrice += buildOrderView(order, orderReviewList, orderNumber,  true, index);
                orderNumber++;
            });
            if(shippingCheckbox.checked){
                overallPrice += parseInt(shippingCheckbox.dataset.price, 10);
            }
            document.getElementById('overallPrice').textContent = overallPrice;
        }

        function removeOrder(index) {
            orders.splice(index, 1);
            updateOrderReview();
        }

        var ShawarmaCheckBox = document.getElementById('ShawarmaCheckBox');
        var drinksCheckBox = document.getElementById('drinksCheckBox');
        var sidesCheckBox = document.getElementById('sidesCheckBox');



        function getCurrentTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        let stopHafira = false;
        function addOrder() {
            var options = Array.from(document.querySelectorAll('input[name="options"]:checked')).map(option => option.value);
            var wrapping = Array.from(document.querySelectorAll('input[name="wrappingOption"]:checked')).map(option => option.value);
            var drinks = Array.from(document.querySelectorAll('input[name="drinkOption"]:checked')).map(option => option.value);
            var additions = Array.from(document.querySelectorAll('input[name="sideOption"]:checked')).map(option => option.value);
            const price = parseInt(document.getElementById('price').textContent, 10);
            const address = "";
            const name = "";
            const phone = "";
            const paymentMethod = "";
            var dishCommentsTmp = document.getElementById('dishComments').value;
            const dishComments = dishCommentsTmp ? dishCommentsTmp : "";

            if (!ShawarmaCheckBox.checked && !sidesCheckBox.checked && !drinksCheckBox.checked) {
                alert("לא נבחרה מנה");
                return;
            }

            if (ShawarmaCheckBox.checked && !wrapping.length) {
                alert("יש לבחור במה לשים את השווארמה");
                return;
            }


            if (ShawarmaCheckBox.checked && !options.length) {
                var userResponse = confirm("לא נבחרו תוספות לשווארמה. תרצו רק בשר? (זה בסדר, אנחנו לא שופטים :) )");
                if(!userResponse){
                    return;
                }
                options = ["רק בשר, אנשים מוזרים... (סליחה ששפטנו)"];
            }

            if(drinksCheckBox.checked && !drinks.length){
                var userResponse = alert("לא נבחרה שתייה למנה");
                return;
            }

            if(sidesCheckBox.checked && !additions.length){
                var userResponse = alert("לא נבחרה תוספת למנה");
                return;
            }

            if(!ShawarmaCheckBox.checked){
                wrapping = [""];
                options = [""];
            }
            
            if(!drinksCheckBox.checked){
                drinks = [""];
            }

            if(!sidesCheckBox.checked){
                additions = [""];
            }
            const orderTime = "";
            const inventoryUpdated = false;
            const order = {name, phone ,wrapping, options, additions, drinks, address, dishComments, price, paymentMethod, orderTime, inventoryUpdated };

            orders.push(order);
            updateOrderReview();
            updateInventory(order, false);

            const checkboxes = document.querySelectorAll('#orderOptions input[type="checkbox"],#ShawarmaCheckBox,#wrappingOptions input[type="radio"], #sidesCheckBox, #sidesOptions input[type="radio"] , #drinksCheckBox, #drinksOptions input[type="radio"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false; // Uncheck each checkbox
            });
            document.getElementById('dishComments').value = "";
            document.getElementById('price').textContent = "0"; // Reset total price
            document.getElementById('orderOptions').style.display = 'none';
            document.getElementById('drinksOptions').style.display = 'none';
            document.getElementById('sidesOptions').style.display = 'none';
            document.getElementById('wrappingOptions').style.display = 'none';
            document.getElementById("orderReviewSection").style.display = 'block'; // Show review section

            if(!stopHafira){
                alert("לשליחת ההזמנה לדוכן יש ללחוץ על כפתור 'שלח הזמנות' בתחתית העמוד. ניתן לצרף מנות נוספות לפני השליחה לצורך הזמנה מרוכזת");
                stopHafira = true;
            }
        }

        function addConstantFieldsToOrders(){

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const paymentMethod = document.querySelector('input[name="paymentOption"]:checked')?.value;
            const orderTime = getCurrentTime();

            // Log the method (or handle the case where no button is selected)
            if (!paymentMethod) {
                alert("יש לבחור שיטת תשלום");
                return false;
            } 

            var address = "";
            if (!name || !phone) {
                    alert("יש למלא שם ומספר טלפון");
                    return false;
            }

            const isValidName = /^[\u0590-\u05FF]+(?:\s+[\u0590-\u05FF]+)+\s*$/.test(name);

            if(!isValidName){
                alert("יש למלא שם וגם שם משפחה")
                return false;
            }
            // validate phone number
            const isValidPhoneNumber = /^[0-9]{10}$/.test(phone);

            if (!isValidPhoneNumber) {
                alert("מספר נייד שגוי. נא להכניס מספר נייד תקני");
                return false;
            }
         
            if(shippingCheckbox.checked){
                address = document.getElementById('addressTextBox').value;
                if(address.length == 0){
                    alert("בחרת משלוח, נא למלא כתובת");
                    return false;
                }

            }
            orders.forEach((order, index) => {
                order.address = address;
                order.name = name;
                order.phone = phone;
                order.paymentMethod = paymentMethod;
                order.orderTime = orderTime;
            });

            return true;
        }

        function buildOrderView(order, parentElement,orderNumber, addRemoveButton, indexToRemove){
            const orderDiv = document.createElement('div');
            const orderDetails = [];
            // Add the dish number
            if(orderNumber){
                orderDetails.push(`מנה ${orderNumber}:`);
            }

            // Add options with prefix if not empty
            if (order.options && order.options.length > 0 && order.options[0].trim() !== '') {
                orderDetails.push(`שווארמה ${order.wrapping} עם: ${order.options.join(', ')}`);
            }

            // Add additions if not empty
            if (order.additions && order.additions.length > 0 && order.additions[0].trim() !== '') {
                orderDetails.push(order.additions);
            }

            // Add drinks if not empty
            if (order.drinks && order.drinks.length > 0 && order.drinks[0].trim() !== '') {
                orderDetails.push(order.drinks);
            }

            if (order.dishComments && order.dishComments.trim() !== '') {
                orderDetails.push(`הערות: (${order.dishComments})`);
            }

            // Add price if valid
            if (order.price && !isNaN(order.price)) {
                orderDetails.push(`<strong>מחיר: ₪${order.price}</strong>`);
            }

            if(addRemoveButton){
                // Create and add a button to the order
                orderDiv.innerHTML = `<div class="order-content">
                                      <span class="order-text">
                                      ${orderDetails.join('<br>')}
                                      </span>
                                      <button class="order-button" data-index="${indexToRemove}">הסר</button>
                                                          </div>`;
                orderDiv.querySelector('button').addEventListener('click', function() {
                    removeOrder(indexToRemove);
                    updateInventory(order, true);
                });
            }
            else{
                orderDiv.innerHTML = `<span class="order-text">
                                    ${orderDetails.join('<br>')}
                                </span>`;
            }

            parentElement.appendChild(orderDiv);

            // Add a blank line between orders
            const spacerDiv = document.createElement('div');
            spacerDiv.style.height = '10px'; // Adjust the height as needed
            parentElement.appendChild(spacerDiv);

            // Update total amount if price is valid
            if (!isNaN(order.price)) {
                return order.price;
            }

            return 0;
        }


        function sendOrders() {

            if (orders.length === 0) {
                alert("אין הזמנות לשליחה");
                return;
            }

            if(!addConstantFieldsToOrders()){
                return;
            }

            orders.forEach(order => {
                push(ref(db, "Orders/"), order).catch((error) => {
                    console.error("Error sending order:", error);
                });
            });

            // Display the preview page with orders
            const previewOrders = document.getElementById('previewOrders');
            previewOrders.innerHTML = '';
            let totalAmount = 0;

            let dishNumber = 1; // Initialize the dish number

            orders.forEach(order => {
                totalAmount += buildOrderView(order,previewOrders, dishNumber);
                dishNumber++; // Increment the dish number
       
            });
            let shipping = shippingCheckbox.checked;
            var shippingFee = document.getElementById('shippingFee').value;
            shippingFee = document.getElementById('shippingFee').textContent
            document.getElementById('shippingFeePreview').textContent = shippingFee;
            document.getElementById('previewTotal').textContent = totalAmount + parseInt(shippingFee,10);
            document.getElementById('namePreview').textContent = document.getElementById('name').value;
            document.getElementById('phonePreview').textContent = document.getElementById('phone').value;
            if(shipping){
                document.getElementById('shippingAddressPreview').textContent = "משלוח ל: " + document.getElementById('addressTextBox').value;
            }

            let paymentMethod = document.querySelector('input[name="paymentOption"]:checked')?.value;
            let paymentComment = " (מסירת ההזמנה מותנית ב";
            if(shipping){
                if(paymentMethod == "מזומן"){
                    paymentComment += "תשלום לשליח)"
                }
                else{
                    paymentComment += "הצגת אישור תשלום לשליח)"
                }
            }
            else{
                if(paymentMethod == "מזומן"){
                    paymentComment += "תשלום בדוכן)"
                }
                else{
                    paymentComment += "הצגת אישור תשלום בדוכן)"
                }
            }
            
            document.getElementById('paymentMethodPreview').textContent = paymentMethod + paymentComment;
            document.getElementById('paymentMethodPreview').style.color = "blue";


            // Hide order page and show preview page
            document.getElementById('order-page').style.display = 'none';
            document.getElementById('preview-page').style.display = 'block';

            orders = []; // Reset orders after sending
        }

        var currenOrderInventory = {
            lafa: 0,
            pita: 0,
            coke: 0,
            fries: 0,
            potato: 0,
            zero: 0,
            grape: 0,
            water: 0,
            fuzeTea: 0,
            sprite: 0,
            schweppes: 0
        }; 


        async function initInventory(){
            const inventoryRef = ref(db, "config/inventory");

                try {
                    const snapshot = await get(inventoryRef);
                    if (snapshot.exists()) {
                        const inventory = snapshot.val();
                        currenOrderInventory.pita = inventory.pita;
                        currenOrderInventory.lafa = inventory.lafa;
                        currenOrderInventory.potato = inventory.potato;
                        currenOrderInventory.fries = inventory.fries;
                        currenOrderInventory.coke = inventory.coke;
                        currenOrderInventory.zero = inventory.zero;
                        currenOrderInventory.grape = inventory.grape;
                        currenOrderInventory.water = inventory.water;
                        currenOrderInventory.fuzeTea = inventory.fuzeTea;
                        currenOrderInventory.sprite = inventory.sprite;
                        currenOrderInventory.schweppes = inventory.schweppes;
                    } else {
                        console.log("No inventory data available");
                    }
                } catch (error) {
                    console.error("Error loading shop status:", error);
                }
        }

        function applyInventoryToView(){
            var radioButton = document.querySelector('input[name="wrappingOption"][value="בלאפה"]');
            if(currenOrderInventory.lafa === 0 ){
                radioButton.disabled = true;
                radioButton.parentElement.style.opacity = 0.4;
            }
            else{
                radioButton.disabled = false;
                radioButton.parentElement.style.opacity = 1;
            }

            radioButton = document.querySelector('input[name="wrappingOption"][value="בפיתה"]');
            if(currenOrderInventory.pita === 0 ){
                radioButton.disabled = true;
                radioButton.parentElement.style.opacity = 0.4;
            }
            else{
                radioButton.disabled = false;
                radioButton.parentElement.style.opacity = 1;
            }

            radioButton = document.querySelector('input[name="sideOption"][value="ציפס"]');
            if(currenOrderInventory.fries === 0 ){
                radioButton.disabled = true;
                radioButton.parentElement.style.opacity = 0.4;
            }
            else{
                radioButton.disabled = false;
                radioButton.parentElement.style.opacity = 1;
            }

            radioButton = document.querySelector('input[name="sideOption"][value="פוטטוס"]');
            if(currenOrderInventory.potato === 0 ){
                radioButton.disabled = true;
                radioButton.parentElement.style.opacity = 0.4;
            }
            else{
                radioButton.disabled = false;
                radioButton.parentElement.style.opacity = 1;
            }

            radioButton = document.querySelector('input[name="drinkOption"][value="קולה"]');
            if(currenOrderInventory.coke === 0 ){
                radioButton.disabled = true;
                radioButton.parentElement.style.opacity = 0.4;
            }
            else{
                radioButton.disabled = false;
                radioButton.parentElement.style.opacity = 1;
            }

            radioButton = document.querySelector('input[name="drinkOption"][value="זירו"]');
            if(currenOrderInventory.zero === 0 ){
                radioButton.disabled = true;
                radioButton.parentElement.style.opacity = 0.4;
            }
            else{
                radioButton.disabled = false;
                radioButton.parentElement.style.opacity = 1;
            }

            radioButton = document.querySelector('input[name="drinkOption"][value="ספרייט"]');
            if(currenOrderInventory.sprite === 0 ){
                radioButton.disabled = true;
                radioButton.parentElement.style.opacity = 0.4;
            }
            else{
                radioButton.disabled = false;
                radioButton.parentElement.style.opacity = 1;
            }

            radioButton = document.querySelector('input[name="drinkOption"][value="פיוזטי"]');
            if(currenOrderInventory.fuzeTea === 0 ){
                radioButton.disabled = true;
                radioButton.parentElement.style.opacity = 0.4;
            }
            else{
                radioButton.disabled = false;
                radioButton.parentElement.style.opacity = 1;
            }

            //radioButton = document.querySelector('input[name="drinkOption"][value="תות בננה"]');
            //if(currenOrderInventory.schweppes === 0 ){
            //    radioButton.disabled = true;
            //    radioButton.parentElement.style.opacity = 0.4;
            //}
            //else{
            //    radioButton.disabled = false;
            //    radioButton.parentElement.style.opacity = 1;
            //}

            //radioButton = document.querySelector('input[name="drinkOption"][value="ענבים"]');
            //if(currenOrderInventory.grape === 0 ){
            //    radioButton.disabled = true;
            //    radioButton.parentElement.style.opacity = 0.4;
            //}
            //else{
            //    radioButton.disabled = false;
            //    radioButton.parentElement.style.opacity = 1;
            //}
            radioButton = document.querySelector('input[name="drinkOption"][value="מים"]');
            if(radioButton === null){
                    console.log("Null drinkOption detected!");
            }
            else{
                    if(currenOrderInventory.water === 0 ){
                        radioButton.disabled = true;
                        radioButton.parentElement.style.opacity = 0.4;
                    }
                    else{
                        radioButton.disabled = false;
                        radioButton.parentElement.style.opacity = 1;
                    }
            }
        }

        
        function updateCount(count, deleted){
            if(deleted){
                return ++count;
            }
            if(count > 0){
                --count;
            }
            return count;
        }

        function updateInventory(order, deleted) {
                switch (order.drinks[0]){
                case "קולה":
                    currenOrderInventory.coke = updateCount(currenOrderInventory.coke, deleted);
                    break;
                case "זירו":
                    currenOrderInventory.zero = updateCount(currenOrderInventory.zero, deleted);
                    break;
                case "פיוזטי":
                    currenOrderInventory.fuzeTea = updateCount(currenOrderInventory.fuzeTea, deleted);
                    break;
                case "ענבים":
                    currenOrderInventory.grape = updateCount(currenOrderInventory.grape, deleted);
                    break;
                case "מים":
                    currenOrderInventory.water = updateCount(currenOrderInventory.water, deleted);
                    break;
                case "ספרייט":
                    currenOrderInventory.sprite = updateCount(currenOrderInventory.sprite, deleted);
                    break;
                case "תות בננה":
                    currenOrderInventory.schweppes = updateCount(currenOrderInventory.schweppes, deleted);
                    break;
                default:
                    break;
                
            }

            switch (order.wrapping[0]){
                case "בפיתה":
                    currenOrderInventory.pita = updateCount(currenOrderInventory.pita, deleted);
                    break;
                case "בלאפה":
                    currenOrderInventory.lafa = updateCount(currenOrderInventory.lafa, deleted);
                    break;
                default:
                    break;
                
            }

            switch (order.additions[0]){
                case "ציפס":
                    currenOrderInventory.fries = updateCount(currenOrderInventory.fries, deleted);
                    break;
                case "פוטטוס":
                    currenOrderInventory.potato = updateCount(currenOrderInventory.potato, deleted);
                    break;
                default:
                    break;
                
            }   
            
            applyInventoryToView();
        }  

        async function initInventoryWrapper(){
                await initInventory();
                applyInventoryToView();
        }

        initInventoryWrapper();

        document.querySelector('#newOrderBtn').addEventListener('click', () => {
            // Reload the page to start a new order
            location.reload();
        });
