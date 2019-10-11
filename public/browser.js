// CREATE
itemTemplate = (item) => {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
      <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${item._id}"class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`
}

let ourHtml = items.map( (item) => {
    return itemTemplate(item);
}).join('')
//INITIAL PAGE LOAD RENDER
document.getElementById("item-list").insertAdjacentHTML('beforeend', ourHtml )


// CREATE
let createField = document.getElementById("create-field");
document.getElementById("create-form").addEventListener('submit', (event) => {
    event.preventDefault();
    axios.post('/create-item', {text: createField.value}).then( (response) => {
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
        createField.value = '';
        createField.focus();
    }).catch( () => {
        console.log('ERROR');
    });
})


document.addEventListener('click', (event) => {
    // DELETE
    if(event.target.classList.contains("delete-me")) {
        if(confirm("Do uou really want to delete permanently")) {
            axios.post('/delete-item', {id: event.target.getAttribute("data-id")}).then( () => {
                // event.target = button clicked .parentE = div .parentE = li (makes up row for entire item)
                event.target.parentElement.parentElement.remove();
            }).catch( () => {
                console.log('ERROR');
            });
        }
    }
    
    // UPDATE
    if(event.target.classList.contains("edit-me")) {
        // alert("EDIT");
        let userInput = prompt("Enter desired new text", event.target.parentElement.parentElement.querySelector(".item-text").innerHTML);
        if(userInput) {
            axios.post('/update-item', {text: userInput, id: event.target.getAttribute("data-id")}).then( () => {
                event.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput;
            }).catch( () => {
                console.log('ERROR');
            });
        }
    }
});

