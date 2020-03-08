// simple MS-DOS style terminal with "DIR" etc
// based on work by https://github.com/eosterberg/terminaljs

const promptTXT = "A:\\>";

var MSDOS = (function () {

	var PROMPT_INPUT = 1, PROMPT_PASSWORD = 2, PROMPT_CONFIRM = 3;

	function flashCursor(inputField, terminalObj) {
		var cursor = terminalObj._cursor
		setTimeout(function () {
			if (inputField.parentElement && terminalObj._shouldBlinkCursor) {
				cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible';
				flashCursor(inputField, terminalObj);
			} else {
				cursor.style.visibility = 'visible';
			}
		}, 500)
	}

	var firstPrompt = true;

	function promptInput(terminalObj, message, PROMPT_TYPE, callback) {

		var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT);
		var inputField = document.createElement('input');
		inputField.style.position = 'absolute';
		inputField.style.zIndex = '-100';
		inputField.style.outline = 'none';
		inputField.style.border = 'none';
		inputField.style.opacity = '0';
		inputField.style.fontSize = '0.2em';

		terminalObj._inputLine.textContent = '';
		terminalObj._input.style.display = 'inline-block';
		terminalObj.html.appendChild(inputField);
		
		flashCursor(inputField, terminalObj);

		if (message.length) terminalObj.print(PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message);

		inputField.onblur = function () {
			terminalObj._cursor.style.display = 'none';
		}

		inputField.onfocus = function () {
			inputField.value = terminalObj._inputLine.textContent;
			terminalObj._cursor.style.display = 'inline';
		}

		terminalObj.html.onclick = function () {
			inputField.focus();
		}

		inputField.onkeydown = function (e) {
			if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
				e.preventDefault()
			} else if (shouldDisplayInput && e.which !== 13) {
				setTimeout(function () {
					terminalObj._inputLine.textContent = inputField.value
				}, 1)
			}
		}
		inputField.onkeyup = function (e) {
			if (PROMPT_TYPE === PROMPT_CONFIRM || e.which === 13) {
				terminalObj._input.style.display = 'none'
				var inputValue = inputField.value
				if (shouldDisplayInput) terminalObj.print(inputValue)
				terminalObj.html.removeChild(inputField)
				if (typeof(callback) === 'function') {
					if (PROMPT_TYPE === PROMPT_CONFIRM) {
						callback(inputValue.toUpperCase()[0] === 'Y' ? true : false)
					} else callback(inputValue)
				}
			}
		}
		if (firstPrompt) {
			firstPrompt = false;
			setTimeout(function () { inputField.focus()	}, 50);
		} else {
			inputField.focus();
		}
	}

	var TerminalConstructor = function (id) {

		this.html = document.createElement('div');
		this.html.className = 'Terminal';
		if (typeof(id) === 'string') { this.html.id = id };

		this._innerWindow = document.createElement('span');//'div');
		this._output = document.createElement('span');//'p');
		this._inputLine = document.createElement('span'); //the span element where the users input is put
		this._cursor = document.createElement('span');
		this._input = document.createElement('span');//p'); //the full element administering the user input, including cursor

		this._shouldBlinkCursor = true;

        this.cls = function() {
            this._output.innerHTML = "";
        }
        
        this.print = function (message) {
            
            // pre mode
            this._output.innerHTML += message;
            
            /*
            // block divs aplenty
            var msgs = message.split('\n');
            for(num in msgs) {
                var newLine = document.createElement('div');
                if (msgs[num]=="") 
                    msgs[num]=="&nbsp;"; // blank line
                newLine.textContent = msgs[num];//message;
                this._output.appendChild(newLine);
            }
            */
		}

		this.input = function (message, callback) {
			promptInput(this, message, PROMPT_INPUT, callback);
		}

		this.password = function (message, callback) {
			promptInput(this, message, PROMPT_PASSWORD, callback);
		}

		this.confirm = function (message, callback) {
			promptInput(this, message, PROMPT_CONFIRM, callback);
		}

		this.clear = function () {
			this._output.innerHTML = '';
		}

		this.sleep = function (milliseconds, callback) {
			setTimeout(callback, milliseconds);
		}

		this.setTextSize = function (size) {
			this._output.style.fontSize = size;
			this._input.style.fontSize = size;
		}

		this.setTextColor = function (col) {
			this.html.style.color = col;
			this._cursor.style.background = col;
		}

		this.setBackgroundColor = function (col) {
			this.html.style.background = col;
		}

		this.setWidth = function (width) {
			this.html.style.width = width;
		}

		this.setHeight = function (height) {
			this.html.style.height = height;
		}

		this.blinkingCursor = function (bool) {
			bool = bool.toString().toUpperCase();
			this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES');
		}

		this._input.appendChild(this._inputLine);
		this._input.appendChild(this._cursor);
		this._innerWindow.appendChild(this._output);
		this._innerWindow.appendChild(this._input);
		this.html.appendChild(this._innerWindow);

		//this.setBackgroundColor('black');
		this.setTextColor('rgba(0,200,64,1)');
		this.setTextSize('24px');
		this.setWidth('100%');
		this.setHeight('100%');

		this.html.style.fontFamily = 'BlockZone, Monaco, Courier, Terminal';
        this.html.style.margin = '0';
        this.html.style.whiteSpace = "pre"; 
        this.html.style.overflow = "hidden";
		this._innerWindow.style.padding = '0px';
		this._input.style.margin = '0';
		this._output.style.margin = '0';
        this._output.style.overflow = "hidden";
        this._cursor.style.background = 'rgba(0,200,64,1)';
		this._cursor.innerHTML = 'C'; //put something in the cursor..
		this._cursor.style.display = 'none'; //then hide it
		this._input.style.display = 'none';
	}

	return TerminalConstructor;
}());

var t1 = new MSDOS();

function commandDotCom(input) {
    
    t1.cls(); // clear
    
    input = input.toUpperCase();
    input = input.replace(".EXE", "");
    
    if (input=="?") input = "HELP";
    if (input=="") input = "HELP";
    if (input=="LS") input = "DIR";
    
    // find a hidden pre in the html
    var found = document.getElementById(input);
    if (found) {
        console.log("found command: " + input);
        console.log("found text: " + found.innerHTML);
        t1.print("\n"+found.innerHTML);
    } else {
        t1.print('Unknown command or file name: ' + input + '.EXE\n');
    }
    
    t1.input(promptTXT, commandDotCom);
}

function init(e) {
    console.log("INIT!");
    
    document.getElementById('monitor').appendChild(t1.html)
    
    commandDotCom("BOOT");
    
}

window.addEventListener("load",init);