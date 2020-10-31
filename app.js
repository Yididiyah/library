const btnAddBook = document.querySelector('.btn-add-book');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.modal');

const table = document.querySelector('#books');
const tableBody = document.querySelector('tbody');

const btnSubmitBook = document.querySelector('.btn-submit');
const inputTitle = document.querySelector('#title');
const inputAuthor = document.querySelector('#author');
const inputPages = document.querySelector('#pages');
const inputRead = document.querySelector('#read');

const chkReadStatus = document.querySelectorAll('#read-status');

let myLibrary = [];
let deleteBookHandler;

function Book(title, author, pages, read) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
}

Book.prototype.info = function() {
    return `${this.title} by ${this.author}, ${this.pages} pages, ${this.read ? 'read' : 'not read yet'}`
}

Book.prototype.toggleReadStatus = function() {
    this.read = this.read ? false : true;
}
function addBookToLibrary(title, author, pages, read){
    // Takes user input and store the new book objects into an array
    myLibrary.push(new Book(title, author, pages, read));
    // TODO: Populate localStorage including the new added book
    localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    // display table if it was hidden
    removeTableIfEmpty();
}

function readStatus(status){
    return status ? 'Read' : 'Not Read Yet';
}

function removeTableIfEmpty(){
    if(myLibrary.length === 0){
        console.log('Table empty, should be removed');
        table.style.display = 'none';
    }else {
        table.style.display = 'table';
    }
}

function addNewBookToTable(index, title, author, pages, read){
    // Updates DOM Table with a book
    const htmlString = `<tr  data-book-number=${index} class="table-item">
                                <td class="delete">
                                    <button class="btn-delete-book">x</button> 
                                </td>
                                <td>${title}</td>
                                <td>${author}</td>
                                <td class="small-table-item">${pages}</td>
                                <td class="small-table-item">${readStatus(read)}</td>
                                <td><input ${readStatus(read) === 'Read' ? 'checked' : ''} type="checkbox" name="read-status" id="read-status"></td>
                            </tr>`;
        tableBody.insertAdjacentHTML('beforeend', htmlString);
    const newChkBox = document.querySelector(`tr[data-book-number='${index}'] #read-status`);
    readStatusListener(newChkBox);
}
// addBookToLibrary('The Hobbit', 'J.R.R. Tolkien', 295, false);
// addBookToLibrary('Naked Economics', 'Charles Wheelan', 260, true);

function displayBooks(){
    // TODO: Read library from local storage
    myLibrary = JSON.parse(localStorage.getItem('myLibrary'));
    // Loop through the array and displays each book on the page
    myLibrary.forEach((book) => {
        const {title, author, pages, read} = book;
        addNewBookToTable(myLibrary.indexOf(book) ,title, author, pages, read);
    })
}
console.log(myLibrary.length);
console.log(table);

if(JSON.parse(localStorage.getItem('myLibrary')).length !== 0){
    displayBooks();
}else {
    // remove table if it's empty
    removeTableIfEmpty();
    console.log('No books in local storage');
}

const rows = document.querySelectorAll('.table-item');
console.log(rows);

function closeModal() {
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
}

function openModal(){
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function clearForm(){
    inputTitle.value = '';
    inputAuthor.value = '';
    inputPages.value = '';
    inputRead.value = '';
}

function deleteBook(num){
    // Remove the book from the myLibrary array
    myLibrary.splice(num, 1);
    // Update Storage
    localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    // Update the displayed table
    const elem = tableBody.querySelector(`tr[data-book-number='${num}']`);
    removeTableIfEmpty();
    tableBody.removeChild(elem);
    console.log('Delete Book Number' , num);
}

function bookEventListener(row){
    row.addEventListener('mouseenter', (e) => {
        const bookItemNumber = e.currentTarget.dataset.bookNumber;
        const deleteBtn = document.querySelector(
            `tr[data-book-number="${bookItemNumber}"] .btn-delete-book`);
            deleteBtn.style.display = 'inherit';
            
            deleteBtn.addEventListener('click', deleteBookHandler = () => {
                deleteBook(bookItemNumber, deleteBtn);
            });
            // console.log('Hovered over row', row);
            // console.dir(e.currentTarget.dataset);
            // console.log(e.currentTarget.dataset.bookNumber);
        });
        row.addEventListener('mouseleave', (e) => {
        // When the mouse leaves hide the delete button and remove the event listener
        const bookItemNumber = e.currentTarget.dataset.bookNumber;
        const deleteBtn = document.querySelector(
            `tr[data-book-number="${bookItemNumber}"] .btn-delete-book`);
        deleteBtn.style.display = 'none';

        deleteBtn.removeEventListener('click', deleteBookHandler);
    });
}

function readStatusListener(chkBox) {
    //TODO: Update read status of books based on the checkbox state
    chkBox.addEventListener('change', function() {
        // Update myLibrary and UI table based on changed state
        myLibrary[this.parentElement.parentElement.dataset.bookNumber] = this.checked;
        this.parentElement.previousElementSibling.textContent =  readStatus(this.checked);
    });
}

function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}


function init() {
    
    btnAddBook.addEventListener('click', () => {
        openModal();
    });
    overlay.addEventListener('click', () => {
        closeModal();
        clearForm();
    });
    btnSubmitBook.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove the Modal
        closeModal();
        //update the table with the new book
        const newBookNumber = myLibrary.length;
        addNewBookToTable(newBookNumber,inputTitle.value, 
            inputAuthor.value,
            inputPages.value,
            inputRead.value
            );
        const newBookRow = document.querySelector(`tr[data-book-number='${newBookNumber}']`);
        bookEventListener(newBookRow);
        // Add the new book to the library
        addBookToLibrary(
            inputTitle.value, 
            inputAuthor.value,
            inputPages.value,
            inputRead.value
            );
        console.log('Submitted');
        clearForm();
    });
    rows.forEach((row) => {
        bookEventListener(row);
    });
    chkReadStatus.forEach((chkBox) => {
        readStatusListener(chkBox);
    });

    if (storageAvailable('localStorage')) {
        // Yippee! We can use localStorage awesomeness

    }
      else {
        // Too bad, no localStorage for us
      }
}

// window.addEventListener('load', init);
init();

// TODO: Checkbox state update doesn't work for JavaScript generated DOM elements