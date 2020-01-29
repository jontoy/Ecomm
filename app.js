const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(
    cookieSession({
        keys: ['ioqdwio']
    })
);
app.use(authRouter);


app.get('/', (req, res) => {
  res.render("home", {session: req.session});
});



app.listen(3000, () => {
    console.log('app started');
})