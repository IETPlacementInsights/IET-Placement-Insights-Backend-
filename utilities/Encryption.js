var bcrypt = require('bcryptjs');
async function encryptPassword(password)
{
    var hash;
    hash = await bcrypt.hash(password,10);
    return hash;
}
async function comparePassword(hashCode,password)
{
    var result = await bcrypt.compare(password,hashCode);
    return result;
}
module.exports = { encryptPassword, comparePassword };