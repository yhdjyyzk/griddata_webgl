let div = document.createElement('div');
div.style.backgroundColor = 'rgba(100, 100, 100, 0.8)';
div.style.position = 'absolute';
div.style.padding = '5px';
div.style.display = 'none';
div.style.color = 'white';
document.body.appendChild(div);

export function tooltip(html) {
   div.innerHTML = html;
}

export function hidden() {
   div.style.display = 'none';
}

export function show(x, y) {
   div.style.display = 'block';
   div.style.left = x + 15 + 'px';
   div.style.top = y - 15 + 'px';
}