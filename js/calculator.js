/* ==========================================================================
   Function Psi — Calculator App
   Scientific-style calculator with keyboard support
   ========================================================================== */

function renderCalculator(container) {
  const id = 'calc-' + Date.now();
  container.innerHTML = `
    <div class="calc-display-wrap">
      <div class="calc-display" id="calc-display-${id}">0</div>
      <div class="calc-prev" id="calc-prev-${id}"></div>
    </div>
    <div class="calc-keypad" id="calc-keypad-${id}">
      <button class="calc-btn calc-func" data-ac="clear">AC</button>
      <button class="calc-btn calc-func" data-op="+/-">+/-</button>
      <button class="calc-btn calc-func" data-op="%">%</button>
      <button class="calc-btn calc-op" data-op="/">÷</button>

      <button class="calc-btn" data-num="7">7</button>
      <button class="calc-btn" data-num="8">8</button>
      <button class="calc-btn" data-num="9">9</button>
      <button class="calc-btn calc-op" data-op="*">×</button>

      <button class="calc-btn" data-num="4">4</button>
      <button class="calc-btn" data-num="5">5</button>
      <button class="calc-btn" data-num="6">6</button>
      <button class="calc-btn calc-op" data-op="-">−</button>

      <button class="calc-btn" data-num="1">1</button>
      <button class="calc-btn" data-num="2">2</button>
      <button class="calc-btn" data-num="3">3</button>
      <button class="calc-btn calc-op" data-op="+">+</button>

      <button class="calc-btn" data-num="0" colspan="2">0</button>
      <button class="calc-btn" data-num=".">.</button>
      <button class="calc-btn calc-eq" data-op="=">=</button>
    </div>
  `;

  const display = document.getElementById(`calc-display-${id}`);
  const prev = document.getElementById(`calc-prev-${id}`);
  const keypad = document.getElementById(`calc-keypad-${id}`);

  let current = '0';
  let previous = null;
  let operator = null;
  let shouldReset = false;

  function update() {
    display.textContent = current;
  }

  function inputNumber(num) {
    if (shouldReset) {
      current = '';
      shouldReset = false;
    }
    if (num === '.' && current.includes('.')) return;
    current = current === '0' ? num : current + num;
    update();
  }

  function inputDecimal() {
    inputNumber('.');
  }

  function chooseOp(op) {
    if (current === '') return;
    if (previous !== null) calculate();
    operator = op;
    previous = current;
    current = '';
    prev.textContent = previous + ' ' + getOpSymbol(op);
  }

  function getOpSymbol(op) {
    const map = { '/': '÷', '*': '×', '-': '−', '+': '+' };
    return map[op] || op;
  }

  function calculate() {
    if (operator === null || previous === null) return;
    const prevVal = parseFloat(previous);
    const currVal = parseFloat(current);
    if (isNaN(prevVal) || isNaN(currVal)) return;
    let result;
    switch (operator) {
      case '+': result = prevVal + currVal; break;
      case '-': result = prevVal - currVal; break;
      case '*': result = prevVal * currVal; break;
      case '/': result = currVal === 0 ? 'Error' : prevVal / currVal; break;
      default: return;
    }
    current = result.toString();
    operator = null;
    previous = null;
    shouldReset = true;
    prev.textContent = '';
    update();
  }

  function clearAll() {
    current = '0';
    previous = null;
    operator = null;
    shouldReset = false;
    prev.textContent = '';
    update();
  }

  function deleteLast() {
    if (shouldReset) return;
    current = current.slice(0, -1) || '0';
    update();
  }

  function negate() {
    current = (parseFloat(current) * -1).toString();
    update();
  }

  function percent() {
    current = (parseFloat(current) / 100).toString();
    update();
  }

  keypad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const num = btn.dataset.num;
    const op = btn.dataset.op;
    const ac = btn.dataset.ac;

    if (ac) { clearAll(); return; }
    if (num !== undefined) { inputNumber(num); return; }
    if (op === '=') { calculate(); return; }
    if (op === '+/-') { negate(); return; }
    if (op === '%') { percent(); return; }
    if (op) { chooseOp(op); return; }
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    // Only handle if a calc window is focused (simple check)
    if (!document.querySelector('.window:not(.minimized)')) return;
    if (/[0-9]/.test(e.key)) inputNumber(e.key);
    if (e.key === '.') inputDecimal();
    if (e.key === '+') chooseOp('+');
    if (e.key === '-') chooseOp('-');
    if (e.key === '*') chooseOp('*');
    if (e.key === '/') chooseOp('/');
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Escape' || e.key === 'Delete') clearAll();
    if (e.key === 'Backspace') deleteLast();
  });

  update();
}
