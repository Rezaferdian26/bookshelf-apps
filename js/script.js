/*
{
    id: string | number,
    title: string,
    author: string,
    year: number,
    isComplete: boolean,
}
*/

const books = [];
const RENDER_EVENT = 'render-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function popUpDialog() {
    const dialogBox = document.createElement('div');
    dialogBox.classList.add('custom-dialog');
    dialogBox.innerText = 'Buku berhasil dihapus';
    const main = document.querySelector('main');
    main.append(dialogBox);
    setTimeout(() => {
        dialogBox.style.opacity = 1;
    }, 0);
    setTimeout(() => {
        dialogBox.remove();
    }, 3000);
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


function makeBookShelf(bookObject) {
    const title = document.createElement('p');
    title.classList.add('title');
    title.innerText = bookObject.title;

    const author = document.createElement('p');
    author.innerText = `Penulis : ${bookObject.author}`;

    const year = document.createElement('p');
    year.innerText = `Tahun : ${bookObject.year}`;

    const listItem = document.createElement('div');
    listItem.classList.add('list-item');
    listItem.append(title, author, year);

    const listContainer = document.createElement('div');
    listContainer.classList.add('list-container');
    listContainer.append(listItem);
    listContainer.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isComplete) {
        const undoButton = document.createElement('span')
        undoButton.classList.add('undo-button');
        undoButton.addEventListener('click', function () {
            undoBookFromComplete(bookObject.id);
        });

        const trashButton = document.createElement('span');
        trashButton.classList.add('trash-button');
        trashButton.addEventListener('click', function () {
            removeBookFromComplete(bookObject.id);
        });

        listContainer.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('span');
        checkButton.classList.add('check-button');
        checkButton.addEventListener('click', function () {
            addBookToComplete(bookObject.id);
        });

        const trashButton = document.createElement('span');
        trashButton.classList.add('trash-button');
        trashButton.addEventListener('click', function () {
            removeBookFromComplete(bookObject.id);
        });

        listContainer.append(checkButton, trashButton);
    }

    return listContainer;
}

function addBookToComplete(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function undoBookFromComplete(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromComplete(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    popUpDialog();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function addBook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const isComplete = document.getElementById('already-read').checked;

    const generatedID = generatedId();
    const bookObject = generatedBookObject(generatedID, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generatedId() {
    return +new Date();
}

function generatedBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('already-read').checked = false;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form-input');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        clearForm();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const completeBooklist = document.getElementById('complete');
    const unreadBookList = document.getElementById('unread');

    completeBooklist.innerHTML = '';
    unreadBookList.innerHTML = '';

    for (const book of books) {
        const bookshelf = makeBookShelf(book);
        if (!book.isComplete) {
            unreadBookList.append(bookshelf);
        } else {
            completeBooklist.append(bookshelf);
        }
    }
});

function makeItemSearch(bookObject) {
    const title = document.createElement('p');
    title.classList.add('title');
    title.innerText = bookObject.title;

    const author = document.createElement('p');
    author.innerText = `Penulis : ${bookObject.author}`;

    const year = document.createElement('p');
    year.innerText = `Tahun : ${bookObject.year}`;

    const listItem = document.createElement('div');
    listItem.classList.add('list-item');

    if (bookObject.isComplete) {
        const status = document.createElement('p');
        status.style.color = 'green';
        status.innerText = 'Selesai dibaca';
        listItem.append(title, author, year, status);
    } else {
        const status = document.createElement('p');
        status.style.color = 'red';
        status.innerText = 'Belum selesai dibaca';
        listItem.append(title, author, year, status);
    }

    const listContainer = document.createElement('div');
    listContainer.classList.add('list-container', 'margintop');
    listContainer.append(listItem);


    return listContainer;
}

function showSearch(search_term) {
    const searchContainer = document.getElementById('search-container');
    searchContainer.innerHTML = '';
    books.filter(item => {
        return item.title.toLowerCase().includes(search_term);
    }).forEach((e) => {
        const searchItem = makeItemSearch(e);
        searchContainer.appendChild(searchItem);
        return 1;
    });
}


document.getElementById('search').addEventListener('input', function (event) {
    const searchContainer = document.getElementById('search-container');
    let search_term = event.target.value.toLowerCase();
    if (search_term === '') {
        searchContainer.innerHTML = '<p>Mohon isi pencarian!</p>';
    } else {
        showSearch(search_term);
    }
})