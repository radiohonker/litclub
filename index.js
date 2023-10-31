let express = require(`express`);
let app = express();
let port = 3000 || process.env.PORT;
let mongoose = require('mongoose');
require('dotenv').config()
async function com() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

var options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
    index: ['index.html'],
    maxAge: '1m',
    redirect: false
}
app.use(express.static('dist', options))

const bodyParser = require("body-parser");
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))


app.use(express.json());
const multer = require('multer');

let cors = require('cors');
app.use(cors());

const book = require("./models/books");
const account = require("./models/accounts");


app.post(`/auth` , async function(req,res){
    let login = req.body.login;
    let password = req.body.pass;

    let filter = await account.findOne({login: login})
    if (!filter) {
        const newAccount = new account({
            login: login,
            pass: password,
            showbookmark: "/x.png",
            bookmark: []
        })
        newAccount.save().then(() => {
            res.send(`Пользователь ${login} зарегистрирован`);
        })
            .catch((error) => {
                res.status(500).send('Ошибка в регистрации пользователя');
            });
    }
    else{
        if (filter.pass != password){
            res.status(401).send('Пароль неправильный')
        }
        else{
            res.send(`Логин за ${login}`)
        }
    }
})
app.get('/books', async function (req, res) {
    try {
        let books = await book.find();
        res.send(books);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при выводе книг на сервере');
    }
});

app.get('/book/:id', async function(req, res){
    const objectId = req.params.id;
    let object = await book.findOne({'_id': objectId});
    res.send(object);
});

app.get('/bookarray', async function(req, res) {
    const id = req.query.id;
    if (!Array.isArray(id)) {
        let object = await book.findOne({'_id': id});
        res.send(object);
    }
    else{
        const books = await book.find({ _id: { $in: id } });
        res.send(books);
    }
});

app.post('/favourite', async function(req, res) {
    let objectId = req.query.id;
    let add = req.query.add;
    try {
        if (add === 'true') {
            let object = await book.findOne({ _id: objectId });
            if (!object) {
                return res.status(404).send('Не найдена книга');
            }
            object.popularity += 1;
            await object.save();
            res.sendStatus(200);
        } else {
            let object = await book.findOne({ _id: objectId });
            if (!object) {
                return res.status(404).send('Не найдена книга');
            }
            object.popularity -= 1;
            await object.save();
            res.sendStatus(200);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});
app.get(`/user`, async function(req,res){
    const objectLogin = req.query.login;
    let object = await account.findOne({'login': objectLogin});
    res.send(object);
})
app.post('/user/favs', async function(req, res) {
    let objectId = req.query.id;
    let objectLogin = req.query.login;
    let add = req.query.add;
    try {
        if (add === 'true') {
            let object = await account.findOne({'login': objectLogin});
            object.favbooks.push(objectId);
            await object.save();
            res.sendStatus(200);
        } else {
            let object = await account.findOne({'login': objectLogin});
            object.favbooks.pull(objectId);
            await object.save();
            res.sendStatus(200);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});
app.post('/book/read', async function(req, res) {
    const objectId = req.query.id;
    const objectLogin = req.query.login;

    try {
        const updatedAccount = await account.findOneAndUpdate(
            { 'login': objectLogin },
            { $pull: { recentRead: objectId } },
            { new: true }
        );

        updatedAccount.recentRead.splice(5);

        updatedAccount.recentRead.unshift(objectId);
        await updatedAccount.save();

        res.send(updatedAccount);
    } catch (error) {
    }
});
const storage = multer.diskStorage({
});
const upload = multer({ storage });

app.post('/create', upload.single('image'), async function (req, res) {
    const { title, description, content, popularity, author, createdAt } = req.body;
    let img = req.body.img || 'unnamed.png';
    const newBook = new book({
        title,
        description,
        content,
        img,
        popularity,
        author,
        createdAt,
    });
    const savedBook = await newBook.save();
    const creator = await account.findOne({ 'login': author });
    creator.myBooks.push(savedBook._id);
    await creator.save();
    res.status(201).json(savedBook);
});


app.post('/user/bookmark', async function(req, res) {
    const bookId = req.body.bookId;
    const login = req.body.login;
    const pageIndex = req.body.pageIndex;
    const wordIndex = req.body.wordIndex;

    try {
        const user = await account.findOne({ 'login': login });
        const Book = await book.findById(bookId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (!Book) {
            return res.status(404).send('Book not found');
        }
        const existingBookmark = user.bookmark.find(bm => bm.bookId === bookId);

        if (existingBookmark) {
            existingBookmark.pageIndex = pageIndex;
            existingBookmark.wordIndex = wordIndex;
        } else {
            const newBookmark = {
                bookId,
                pageIndex,
                wordIndex
            };
            console.log(newBookmark)
            user.bookmark.push(newBookmark);
        }

        await user.save();

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post('/user/bookmark/img', async function(req, res) {
    const bookmark = req.body.img;
    const login = req.body.login;

    try {
        const user = await account.findOne({ 'login': login });

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.showbookmark = bookmark;
        await user.save();

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.post('/post-comment', async function(req,res){
    console.log(1)
    try{
        try {
            const id = req.body.id;
            const author = req.body.author;
            const date = req.body.date;
            const content = req.body.content;
            console.log(id,author,date,content)
            const item = await book.findById(id);
            if (!item) {
                return res.status(404).send('Book not found');
            }

            item.comments.push({
                'author': author,
                'date': date,
                'content': content,
            })
            await item.save();
            res.sendStatus(200);
            console.log(3)
        } catch (err) {
            console.error(err);
            res.status(500).send('aeae');
        }


    } catch (err){
        console.error(err);
        res.status(500).send('Server error');
    }

})
com().then(() => {
    app.listen(port, () => {
        console.log(`Listening http://localhost:${port}`);
    });
});