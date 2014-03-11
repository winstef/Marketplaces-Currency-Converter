var currency, current, select, button, year;
		window.onload = load;

		function load() {
            
            year    = document.getElementById("year");                       
			current = document.getElementById("current");
			select  = document.getElementById("currency");
			button  = document.getElementById("save");
             
            year.innerHTML = new Date().getFullYear();
			currency = localStorage.envatoLocalCurrency;
			
			if (!currency) {
				currency = "AUTO";
			}
			
			current.innerHTML = currency;
            select.value = currency;
			checkCurrent();
			select.onchange = checkCurrent;
			button.onclick = updateCurrency;
		}

		function checkCurrent() {
			if (select.value === currency) {
				button.disabled = true;
			} else {
				button.disabled = false;
			}
		}

		function updateCurrency() {
            
			currency = select.value;
			current.innerHTML = currency;
            if(currency == "AUTO"){
                localStorage.envatoLocalCurrency = "AUTO";
            }else{
                localStorage.envatoLocalCurrency = currency;
            }
			button.disabled = true;
		}
