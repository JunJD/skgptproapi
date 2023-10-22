const express = require('express');
// 用于处理post请求的消息体
const bodyParser = require('body-parser');
const app = express();
const Articles = require('./db').Articles;

// 使用body-parser,支持编码为json的请求体
app.use(bodyParser.json());
// 支持编码为表单的消息体
app.use(bodyParser.urlencoded(
    {
        extended: true
    }
))

const port = process.env.PORT || 3002
// 获取key列表
app.get('/sKeys', (req, res, next) => {
    Articles.all((err, sKeys) => {
        if (err) return next(err);
        res.send(sKeys)
    })
});
// 获取某一篇key
app.get('/sKeys/:id', (req, res, next) => {
    Articles.find(req.params.id, (err, article) => {
        if (err) return next(err);
        res.send(article)
    })
});
// 删除一篇key
app.delete('/sKeys/:id', (req, res, next) => {
    Articles.delete(req.params.id, (err, article) => {
        if (err) return next(err);
        res.send("删除成功")
    })
});

// 创建一篇key 使用消息体解析
app.post('/sKeys', (req, res, next) => {
    Articles.create({
        "title": req.body.title ? req.body.title : '',
        "content": req.body.content ? req.body.content : ''
    }, (err, data) => {
        if (err) return next(err);
        res.send('添加成功')
    });
});

// 更新一篇key数据
app.put('/sKeys/:id', (req, res, next) => {
    Articles.update({
        "id":req.params.id,
        "title": req.body.title ? req.body.title : '',
        "content": req.body.content ? req.body.content : ''
    }, (err, data) => {
        if(err) return next(err);
        res.send('更新成功')
    });
})


app.listen(port, () => {
    console.log(`server susscess localhost:${port}`)
})