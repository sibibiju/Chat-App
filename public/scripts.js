const username = prompt("what is your username");

const socket = io('http://localhost:3001', {
    query: {
        username: username
    }
});
let nsSocket = "";

socket.on('nsList', (nsData) => {

    let namespacesDiv = document.querySelector(".namespaces");
    namespacesDiv.innerHTML = "";

    for (ns of nsData) {
        namespacesDiv.innerHTML += `<div class="namespace" ns="${ns.endpoint}"><img src="${ns.img}"></div>`
    }

    Array.from(document.getElementsByClassName("namespace")).forEach((elem) => {
        elem.addEventListener('click', (e) => {
            let nsEndpoint = elem.getAttribute('ns');
            joinNs(nsEndpoint);
            console.log(nsEndpoint);
        });
    });
    joinNs("/wiki");
});

let search_box = document.querySelector("#search-box");
search_box.addEventListener('input', (e) => {
    console.log(e.target.value);

    let messages = Array.from(document.getElementsByClassName('message-text'));

    messages.forEach((msg) => {
        let liElement = msg.parentElement.parentElement;
        if (msg.innerHTML.toLowerCase().indexOf(e.target.value) === -1) {
            liElement.style.display = "none";
        } else {
            liElement.style.display = "block";
        }
    });
});