const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
    constructor(filename) {
        if (!filename){
            throw new Error('Error: no filename specified for repository!');
        }

        this.filename = filename;
        try{
            fs.accessSync(this.filename)
        } catch (err) {
            fs.writeFileSync(this.filename, '[]');
        }
    }
    randomId() {
        return crypto.randomBytes(6).toString('hex');
    }
    async getAll() {
        return JSON.parse(await fs.promises.readFile(this.filename, {encoding: 'utf8'}));
        }
    async getOne(id) {
        const records = await this.getAll();
        return records.find(record => record.id === id);
    }
    async getOneBy(filters) {
        const records = await this.getAll();
        for (let record of records) {
            let found = true;
            for (let key in filters){
                if (filters[key] !== record[key]){
                    found = false;
                    continue
                }
            }
            if (found){
                return record;
            }
        }
    }

    async delete(id) {
        const records = await this.getAll();
        const targetIndex = records.findIndex(record => record.id === id);
        records.splice(targetIndex, 1);
        await this.writeAll(records);
    }

    async update(id, attrs) {
        const records = await this.getAll();
        const record = records.find(record => record.id === id);

        if (!record) {
            throw new Error(`Error: record not found at id ${id}`);
        }
        Object.assign(record, attrs);
        await this.writeAll(records);
    }
    async create(attrs) {
        attrs.id = this.randomId();
        const salt = crypto.randomBytes(16).toString('hex');

        const buffer = await scrypt(attrs.password, salt, 64);
        attrs.password = `${buffer.toString('hex')}.${salt}`;
        const records = await this.getAll();
        records.push(attrs);
        await this.writeAll(records);
        return attrs
    }
    async passwordsMatch(supplied, saved) {
        const [hashed, salt] = saved.split('.');
        const buffer = await scrypt(supplied, salt, 64);
        return (hashed === buffer.toString('hex'))
    }

    


    async writeAll(records){
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }

}

module.exports = new UsersRepository('users.json');
