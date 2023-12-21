document.addEventListener('DOMContentLoaded', function () {
    const inputForm = document.getElementById('inputBook');
    const searchForm = document.getElementById('searchBook');
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');

    inputForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    });

    function addBook() {
        const titleInput = document.getElementById('inputBookTitle');
        const authorInput = document.getElementById('inputBookAuthor');
        const yearInput = document.getElementById('inputBookYear');
        const isCompleteCheckbox = document.getElementById('inputBookIsComplete');

        const id = generateId();
        const title = titleInput.value;
        const author = authorInput.value;
        const year = parseInt(yearInput.value.trim(), 10);
        const isComplete = isCompleteCheckbox.checked;

        if (title && author && !isNaN(year)) {
            const newBook = createBook(id, title, author, year, isComplete);

            if (isComplete) {
                completeBookshelfList.appendChild(newBook);
            } else {
                incompleteBookshelfList.appendChild(newBook);
            }

            updateStorage();
            inputForm.reset();
        } else {
            alert('Mohon lengkapi data buku terlebih dahulu.');
        }
    }

    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function createBook(id, title, author, year, isComplete) {
        const book = document.createElement('article');
        book.classList.add('book_item');
        book.setAttribute('data-id', id);

        const bookInfo = document.createElement('div');
        bookInfo.innerHTML = `<h3>${title}</h3><p>Penulis: ${author}</p><p>Tahun: ${year}</p>`;
        book.appendChild(bookInfo);

        const bookAction = document.createElement('div');
        bookAction.classList.add('action');

        const moveButton = document.createElement('button');
        moveButton.textContent = isComplete ? 'Belum selesai di Baca' : 'Selesai dibaca';
        moveButton.classList.add(isComplete ? 'green' : 'red');
        moveButton.addEventListener('click', function () {
            moveBook(id, book, isComplete);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus buku';
        deleteButton.classList.add('red');
        deleteButton.addEventListener('click', function () {
            deleteBook(id, book);
        });

        bookAction.appendChild(moveButton);
        bookAction.appendChild(deleteButton);
        book.appendChild(bookAction);

        return book;
    }

    function moveBook(id, book, isComplete) {
        const destinationList = isComplete ? incompleteBookshelfList : completeBookshelfList;
        const moveButton = book.querySelector('.action > button');

        moveButton.textContent = isComplete ? 'Selesai dibaca' : 'Belum selesai di Baca';
        moveButton.classList.remove(isComplete ? 'green' : 'red');
        moveButton.classList.add(isComplete ? 'red' : 'green');

        moveButton.removeEventListener('click', function () {
            moveBook(id, book, isComplete);
        });

        const newMoveButton = moveButton.cloneNode(true);
        moveButton.parentNode.replaceChild(newMoveButton, moveButton);

        newMoveButton.addEventListener('click', function () {
            moveBook(id, book, !isComplete);
        });

        destinationList.appendChild(book);
        updateStorage();
    }

    function deleteBook(id, book) {
        const parentList = book.parentNode;
        parentList.removeChild(book);
        updateStorage();
    }

    function updateStorage() {
        const incompleteBooks = Array.from(incompleteBookshelfList.children).map(extractBookData);
        const completeBooks = Array.from(completeBookshelfList.children).map(extractBookData);

        localStorage.setItem('incompleteBooks', JSON.stringify(incompleteBooks));
        localStorage.setItem('completeBooks', JSON.stringify(completeBooks));
    }

    function extractBookData(book) {
        const id = book.getAttribute('data-id');
        const title = book.querySelector('h3').textContent;
        const author = book.querySelector('p:nth-child(2)').textContent.slice(9);
        const year = parseInt(book.querySelector('p:nth-child(3)').textContent.slice(7), 10);
        const isComplete = book.querySelector('.action > button').classList.contains('red');

        return { id, title, author, year, isComplete };
    }

    function loadStorage() {
        const incompleteBooks = JSON.parse(localStorage.getItem('incompleteBooks')) || [];
        const completeBooks = JSON.parse(localStorage.getItem('completeBooks')) || [];

        incompleteBooks.forEach(function (bookData) {
            const book = createBook(bookData.id, bookData.title, bookData.author, bookData.year, false);
            incompleteBookshelfList.appendChild(book);
        });

        completeBooks.forEach(function (bookData) {
            const book = createBook(bookData.id, bookData.title, bookData.author, bookData.year, true);
            completeBookshelfList.appendChild(book);
        });
    }

    function searchBook() {
        const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
        const allBooks = Array.from(incompleteBookshelfList.children)
            .concat(Array.from(completeBookshelfList.children));

        allBooks.forEach(function (book) {
            const title = book.querySelector('h3').textContent.toLowerCase();
            const isMatch = title.includes(searchInput);

            book.style.display = isMatch ? '' : 'none';
        });
    }

    loadStorage();
});
