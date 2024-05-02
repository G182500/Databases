const { MongoClient } = require("mongodb");
const { Pool } = require('pg'); //PostgreSQL
require('dotenv').config(); //.env

async function run(cnpj) {
    //Conexão MongoDB
    const uri = process.env.DB_URL; //Exemplo: "mongodb+srv://dev:KBF3cnwj4Mn5u1uJ@xxx0.iF58Lg1.gcp.mongodb.net/databaseName"
    const client = new MongoClient(uri);
    const database = client.db('databaseName');
    const collection = database.collection('collectionName');

    //Conexão PostgreSQL
    const pool = new Pool({
        connectionString: process.env.CONNECTION_STRING //Exemplo: postgres://user:password@host:port/database
    });
    const client2 = await pool.connect();
    
    try {
        const query = { cnpj: cnpj }; //Buscar o CNPJ passado em MongoDB (JSON)
        const { legalName, fantasyName, password, contact: { email} } = await collection.findOne(query); //...find(x).toArray();
        
        //Inserir registro em PostgreSQL
        const insert1 = await client2.query(`INSERT INTO databaseName (cnpj, legal_name, fantasy_name) VALUES ('${cnpj}', '${legalName}', '${fantasyName}')`)
        //Buscar 'id' do registro recém criado
        const selectId = await client2.query(`SELECT id FROM databaseName WHERE cnpj = '${cnpj}'`);
        const { id } = selectId.rows[0]; //destructuring
        console.log(id);
    } catch(e) {
        console.log(e);
    } finally {
        //Fechar conexões com os databases
        await client.close();
        client2.release();
    }
}
run(); //Inserir o cnpj aqui

//run via terminal -> node script.js