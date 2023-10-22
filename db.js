const sqlite3 = require('sqlite3').verbose();

const dbname = 'mysqlite';
// 创建并连接一个数据库
const db = new sqlite3.Database(dbname)

// 创建一个articles表
db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS sKeys
        (id integer primary key,title,content TEXT)
    `;
    // 如果没有articles表,创建一个
    db.run(sql);
});

// Skeys API
class Skeys {
    static fix = 0
    static oldFix = 0
    // 获取所有key
    static all(cb) {
        Skeys.fix--
        Skeys.oldFix = Skeys.fix
        // 使用sqlite3的all
        db.all('SELECT * FROM sKeys', cb);
    }
    // 根据id 获取key
    static find(id, cb) {
        // 使用sqlite3的get
        db.get('SELECT * FROM sKeys WHERE id = ?', id, cb);
    }
    // 根据model 获取key
    static findByModel(model, cb) {
        // 使用sqlite3的get
        db.get('SELECT * FROM sKeys WHERE model = ?', model, cb);
    }
    // 添加一个条key记录
    static create(data, cb) {
        Skeys.fix++
        const sql = `
                INSERT INTO 
                sKeys(title,content) 
                VALUES(?,?) 
                ;select last_insert_rowid();`;
        db.run(sql, data.title, data.content, cb);
    }
    // 删除一篇key
    static delete(id, cb) {
        Skeys.fix++
        if (!id) return cb(new Error(`缺少参数id`));
        db.run('DELETE FROM sKeys WHERE id=?', id, cb)
    }
    // 更新一篇key数据
    static update(data, cb) {
        Skeys.fix++
        const sql = `
            UPDATE sKeys
            SET title=?,content=?
            WHERE id=?
        `
        db.run(sql, data.title, data.content, data.id, cb)
    }
}
module.exports.Skeys = Skeys;