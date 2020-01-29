const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository')

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
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
}
module.exports = new UsersRepository('users.json');
