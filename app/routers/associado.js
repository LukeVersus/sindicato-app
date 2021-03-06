require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
const base64Img = require('base64-img');
const fs = require('fs');
const path = require('path');
var base64 = require('file-base64');
var multer = require('multer');
var upload = multer();

let lista = [];
let estados = [];
let setores = [];
let documento;
var moment = require('moment');
var S = require('string');
let anexo;


module.exports = async function (app) {

    app.use(cookieParser());
    app.use(session({
        secret: "2C44-4D44-WppQ38S"
    }));

    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {              
            request({
                url: process.env.API_HOST + rota + "/0/10?sort=nome!asc",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    const finallista = {
                        id: body.data.content[i].id,
                        nome: body.data.content[i].nome,
                        anexo: body.data.content[i].anexo_documento,
                        cpf: body.data.content[i].cpf,
                        status: body.data.content[i].status
                    };

                    if(body.data.content[i].status == 'APROVAR'){
                        lista.push(finallista);
                    };
                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', { itens: lista, page: rota, IdUser: req.session.IdUser,
                            NomeUser: req.session.NomeUser,
                            NivelUser: req.session.NivelUser,
                            EmailUser: req.session.EmailUser, informacoes: req.session.json, number: body.data.number, totalPages: body.data.totalPages});
                    }
                });
                return lista;
            });
        }
    });

    app.post('/app/' + rota + '/list', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {           
            var url;
            if (req.body.busca) {
                url = process.env.API_HOST + rota  + '/' + req.body.page +  "/cpf/" + req.body.busca + "/" + req.body.size;
            } else {
                url = process.env.API_HOST + rota + "/" + req.body.page + "/" + req.body.size + "?sort=nome!asc";
            }
            request({
                url: url,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    const finallista = {
                        id: body.data.content[i].id,
                        nome: body.data.content[i].nome,
                        cpf: body.data.content[i].cpf,
                    };
                    lista.push(finallista);
                }

                return res.json({
                    itens: lista,
                    page: rota,
                    informacoes: req.session.json,
                    number: body.data.number,
                    totalPages: body.data.totalPages
                });

            });

        }
    });


    // Rota para exibição da View Listar pre-cadastrados
    app.get('/app/' + rota + '/pre-cadastro', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/0/10?sort=nome!asc",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    const finallista = {
                        id: body.data.content[i].id,
                        nome: body.data.content[i].nome,
                        cpf: body.data.content[i].cpf,
                        status: body.data.content[i].status,
                        anexo: body.data.content[i].anexo_documento,
                        nivel: body.data.content[i].nivel,
                        area: body.data.content[i].area
                    };
                    if(body.data.content[i].status != 'APROVAR'){
                        lista.push(finallista);
                    };                    
                }
                res.format({
                    html: function () {
                        res.render(rota + '/Pre-cadastro', { itensDois: lista, page: rota, IdUser: req.session.IdUser,
                            NomeUser: req.session.NomeUser,
                            NivelUser: req.session.NivelUser,
                            EmailUser: req.session.EmailUser, informacoes: req.session.json, number: body.data.number, totalPages: body.data.totalPages, });
                    }
                });
                return lista;
            });
        }
    });
    app.post('/app/' + rota + '/pre-cadastro', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {           
            var url;
            if (req.body.busca) {
                url = process.env.API_HOST + rota + "/cpf/" + req.body.busca + '/' + req.body.page + "/" + req.body.size;
            } else {
                url = process.env.API_HOST + rota + "/" + req.body.page + "/" + req.body.size + "?sort=nome!asc";
            }
            request({
                url: url,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    const finallista = {
                        id: body.data.content[i].id,
                        nome: body.data.content[i].nome,
                        cpf: body.data.content[i].cpf,
                        status: body.data.content[i].status,
                        nivel: body.data.content[i].nivel,
                        area: body.data.content[i].area
                    };
                    lista.push(finallista);
                }

                return res.json({
                    itensDois: lista,
                    page: rota,
                    informacoes: req.session.json,
                    number: body.data.number,
                    totalPages: body.data.totalPages
                });

            });

        }
    });


    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {            
            request({
                url: process.env.API_HOST + "municipio/estado/21",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
            }, async function (error, response, body) {
                municipios = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome
                    };
                    municipios.push(finalarea);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/Create', { itensMunicipios: municipios, page: rota, IdUser: req.session.IdUser,
                            NomeUser: req.session.NomeUser,
                            NivelUser: req.session.NivelUser,
                            EmailUser: req.session.EmailUser, informacoes: req.session.json });
                    }
                });
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('file'), function (req, res) {
        var datanasc = moment(req.body.datanascimento).toDate();

        const file = req.file;
        let doc = "";
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            doc = buf.toString('base64');
        }

        let cpfTratado = req.body.cpf;
        cpfTratado = S(cpfTratado).replace('.', '').s;
        cpfTratado = S(cpfTratado).replace('.', '').s;
        req.body.cpf = S(cpfTratado).replace('-', '').s;
        
        request({
            url: process.env.API_HOST + rota,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
            "anexo_documento": doc,
            "nome_escola": req.body.nome_escola,
            "nome": req.body.nome,
            "orgao_expedidor": req.body.orgao_expedidor,
            "atividade_funcional": req.body.atividade_funcional,
            "matricula": req.body.matricula,
            "rg": req.body.rg,
            "cpf": req.body.cpf,
            "sexo": req.body.sexo,
            "turno": req.body.turno,
            "endereco": {
                "logradouro": req.body.logradouro,
                "numero": req.body.numero,
                "complemento": req.body.complemento,
                "bairro": req.body.bairro,
                "cep": req.body.cep,
                "tel_res": req.body.tel_res,
                "tel_cel": req.body.tel_cel,
                "municipio": {
                    "id": req.body.municipio
                }
            },
            "disciplina": req.body.disciplina,
            "tpEstadoCivil": req.body.tpEstadoCivil,
            "tpRedeEnsino": req.body.tpRedeEnsino,
            "situacao": req.body.situacao,
            "status": "PRE_CADASTRADO",
            "validacao": false,
            "datanascimento": datanasc,
            "tpEscolaridade": req.body.tpEscolaridade,
            "faixaSalario": req.body.faixaSalario,
            "celular": req.body.tel_cel,
            "municipio_lotacao": {
                "id": req.body.municipio_lotacao
                }
            },

        }, function (error, response, body) {
            console.log(body.data);
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível cadastrar. " + body.errors);
                res.redirect('/');
            } else {
                req.flash("success", "Associado cadastrado.");
                if(req.body.status == 'PRE_CADASTRADO'){
                    res.redirect('/app/' + rota + '/pre-cadastro');                    
                }else{
                    res.redirect('/app/' + rota + '/list');                    
                }
                return true; 
            }            
        });
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            
            request({
                url: process.env.API_HOST + "municipio/estado/21",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
            }, async function (error, response, body) {
                estados = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                        sigla: body.data[i].sigla
                    };
                    estados.push(finalarea);
                }
                request({
                    url: process.env.API_HOST + rota + "/" + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {

                    res.format({
                        html: function () {
                            res.render(rota + '/Edit', {

                                id: body.data.id,
                                nome_escola: body.data.nome_escola,
                                nome: body.data.nome,
                                anexo: body.data.anexo_documento,
                                orgao_expedidor: body.data.orgao_expedidor,
                                nivel: body.data.nivel,
                                atividade_funcional: body.data.atividade_funcional,
                                area: body.data.area,
                                matricula: body.data.matricula,
                                status: body.data.status,
                                turno: body.data.turno,
                                rg: body.data.rg,
                                cpf: body.data.cpf,
                                sexo: body.data.sexo,
                                endereco: {
                                    id: body.data.endereco != null ? body.data.endereco.id : null,
                                    logradouro: body.data.endereco != null ? body.data.endereco.logradouro : null,
                                    numero: body.data.endereco != null ? body.data.endereco.numero : null,
                                    complemento: body.data.endereco != null ? body.data.endereco.complemento : null,
                                    bairro: body.data.endereco != null ? body.data.endereco.bairro : null,
                                    cep: body.data.endereco != null ? body.data.endereco.cep : null,
                                    tel_res: body.data.endereco != null ? body.data.endereco.tel_res : null,
                                    tel_cel: body.data.endereco != null ? body.data.endereco.tel_cel : null,                                    
                                    /*
                                    municipio: {
    
                                        id: body.data.endereco != null ? body.data.endereco.municipio.id : 0,
                                        nome: body.data.endereco != null ? body.data.endereco.municipio.nome : '',
                                        estado: {
                                            id: body.data.endereco != null ? body.data.endereco.municipio.estado.id : 0,
                                            nome: body.data.endereco != null ? body.data.endereco.municipio.estado.nome : '',
                                            sigla: body.data.endereco != null ? body.data.endereco.municipio.estado.sigla : '',
                                        }
                                    }
                                    */
                                },
                                municipio: body.data.endereco.municipio.id != null ? body.data.endereco.municipio.id : 0,
                                municipio_lotacao: body.data.municipio_lotacao.id != null ? body.data.municipio_lotacao.id : 0,
                                usuario: body.data.usuario != null ? body.data.usuario.id : null,
                                disciplina: body.data.disciplina,
                                tpEstadoCivil: body.data.tpEstadoCivil,
                                tpRedeEnsino: body.data.tpRedeEnsino,
                                situacao: body.data.situacao,
                                datanascimento: moment(body.data.datanascimento).format("YYYY-MM-DD"),
                                tpEscolaridade: body.data.tpEscolaridade,
                                faixaSalario: body.data.faixaSalario,
                                celular: body.data.celular,
                                page: rota, 
                                IdUser: req.session.IdUser,
                                NomeUser: req.session.NomeUser,
                                NivelUser: req.session.NivelUser,
                                EmailUser: req.session.EmailUser,
                                informacoes: req.session.json,
                                itensEstados: estados
                            });
                        }
                    });
                });
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('file'), function (req, res) {
        
        const file = req.file;
        let doc = "";
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            doc = buf.toString('base64');
        }

        var cadastrodata = moment.now();
        var datanasc = moment(req.body.datanascimento).toDate();        
        var validacao;
        if(req.body.status == 'APROVAR'){
            validacao = true;
        }
        let cpfTratado = req.body.cpf;
        cpfTratado = S(cpfTratado).replace('.', '').s;
        cpfTratado = S(cpfTratado).replace('.', '').s;
        req.body.cpf = S(cpfTratado).replace('-', '').s;
        request({
            url: process.env.API_HOST + rota,
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "anexo_documento": doc,
                "nome_escola": req.body.nome_escola,
                "nome": req.body.nome,
                "id": req.body.id,
                "orgao_expedidor": req.body.orgao_expedidor,
                "nivel": req.body.nivel,
                "atividade_funcional": req.body.atividade_funcional,
                "area": req.body.area,
                "matricula": req.body.matricula,
                "rg": req.body.rg,
                "cpf": req.body.cpf,
                "sexo": req.body.sexo,
                "turno": req.body.turno,
                "endereco": {
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero,
                    "complemento": req.body.complemento,
                    "bairro": req.body.bairro,
                    "cep": req.body.cep,
                    "tel_res": req.body.tel_res,
                    "tel_cel": req.body.tel_cel,
                    "municipio": {
                        "id": req.body.municipio
                    }
                },
                "disciplina": req.body.disciplina,
                "tpEstadoCivil": req.body.tpEstadoCivil,
                "tpRedeEnsino": req.body.tpRedeEnsino,
                "situacao": req.body.situacao,
                "status": req.body.status,
                "validacao": validacao,
                "datanascimento": datanasc,
                "tpEscolaridade": req.body.tpEscolaridade,
                "faixaSalario": req.body.faixaSalario,
                "celular": req.body.celular,
                "municipio_lotacao": {
                    "id": req.body.municipio_lotacao
                }
            },

        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível cadastrar. " + body.errors);
                res.redirect('/');
            } else {
                req.flash("success", "Associado atualizado.");
                if(req.body.status != 'APROVAR'){
                    res.redirect('/app/' + rota + '/pre-cadastro');
                    return true;
                }else{
                    res.redirect('/app/' + rota + '/list');
                    return true;
                } 
            }            
        });
    })

      // Rota para exibição da View Editar PRE-CADASTRADOS
      app.get('/app/' + rota + '/edit-pre-cadastro/:id', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "municipio/estado/21",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
            }, async function (error, response, body) {
                estados = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                        sigla: body.data[i].sigla
                    };
                    estados.push(finalarea);
                }
                request({
                    url: process.env.API_HOST + rota + "/" + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {

                    res.format({
                        html: function () {
                            res.render(rota + '/Edit-pre-cadastro', {

                                id: body.data.id,
                                nome_escola: body.data.nome_escola,
                                nome: body.data.nome,
                                orgao_expedidor: body.data.orgao_expedidor,
                                nivel: body.data.nivel,
                                atividade_funcional: body.data.atividade_funcional,
                                area: body.data.area,
                                matricula: body.data.matricula,
                                status: body.data.status,
                                rg: body.data.rg,
                                cpf: body.data.cpf,
                                sexo: body.data.sexo,
                                turno: body.data.turno,
                                endereco: {
                                    id: body.data.endereco != null ? body.data.endereco.id : null,
                                    logradouro: body.data.endereco != null ? body.data.endereco.logradouro : null,
                                    numero: body.data.endereco != null ? body.data.endereco.numero : null,
                                    complemento: body.data.endereco != null ? body.data.endereco.complemento : null,
                                    bairro: body.data.endereco != null ? body.data.endereco.bairro : null,
                                    cep: body.data.endereco != null ? body.data.endereco.cep : null,
                                    tel_res: body.data.endereco != null ? body.data.endereco.tel_res : null,
                                    tel_cel: body.data.endereco != null ? body.data.endereco.tel_cel : null,
                                    //municipio: body.data.endereco.municipio.id,
                                    /*
                                    municipio: {
    
                                        id: body.data.endereco != null ? body.data.endereco.municipio.id : 0,
                                        nome: body.data.endereco != null ? body.data.endereco.municipio.nome : '',
                                        estado: {
                                            id: body.data.endereco != null ? body.data.endereco.municipio.estado.id : 0,
                                            nome: body.data.endereco != null ? body.data.endereco.municipio.estado.nome : '',
                                            sigla: body.data.endereco != null ? body.data.endereco.municipio.estado.sigla : '',
                                        }
                                    }
                                    */
                                },
                                municipio: body.data.endereco.municipio.id != null ? body.data.endereco.municipio.id : 0,
                                municipio_lotacao: body.data.municipio_lotacao.id != null ? body.data.municipio_lotacao.id : 0,
                                usuario: body.data.usuario != null ? body.data.usuario.id : null,
                                disciplina: body.data.disciplina,
                                tpEstadoCivil: body.data.tpEstadoCivil,
                                tpRedeEnsino: body.data.tpRedeEnsino,
                                situacao: body.data.situacao,
                                datanascimento: moment(body.data.datanascimento).format("YYYY-MM-DD"),
                                tpEscolaridade: body.data.tpEscolaridade,
                                faixaSalario: body.data.faixaSalario,                                
                                celular: body.data.celular,
                                page: rota,
                                IdUser: req.session.IdUser,
                                NomeUser: req.session.NomeUser,
                                NivelUser: req.session.NivelUser,
                                EmailUser: req.session.EmailUser,
                                informacoes: req.session.json,
                                itensEstados: estados
                            });
                        }
                    });
                });
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit-pre-cadastro/submit', upload.single('photo'), function (req, res) {
        var cadastrodata = moment.now();
        var datanasc = moment(req.body.datanascimento).toDate();        
        var validacao;
        if(req.body.status == 'APROVAR'){
            validacao = true;
        }
        let cpfTratado = req.body.cpf;
        cpfTratado = S(cpfTratado).replace('.', '').s;
        cpfTratado = S(cpfTratado).replace('.', '').s;
        req.body.cpf = S(cpfTratado).replace('-', '').s;
        request({
            url: process.env.API_HOST + rota,
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "nome_escola": req.body.nome_escola,
                "nome": req.body.nome,
                "id": req.body.id,
                "orgao_expedidor": req.body.orgao_expedidor,
                "nivel": req.body.nivel,
                "atividade_funcional": req.body.atividade_funcional,
                "area": req.body.area,
                "matricula": req.body.matricula,
                "rg": req.body.rg,
                "cpf": req.body.cpf,
                "sexo": req.body.sexo,
                "turno": req.body.turno,
                "endereco": {
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero,
                    "complemento": req.body.complemento,
                    "bairro": req.body.bairro,
                    "cep": req.body.cep,
                    "tel_res": req.body.tel_res,
                    "tel_cel": req.body.tel_cel,
                    "municipio": {
                        "id": req.body.municipio
                    }
                },
                "disciplina": req.body.disciplina,
                "tpEstadoCivil": req.body.tpEstadoCivil,
                "tpRedeEnsino": req.body.tpRedeEnsino,
                "situacao": req.body.situacao,
                "status": req.body.status,
                "validacao": validacao,
                "datanascimento": datanasc,
                "tpEscolaridade": req.body.tpEscolaridade,
                "faixaSalario": req.body.faixaSalario,
                "celular": req.body.celular,
                "municipio_lotacao": { "id": req.body.municipio_lotacao
                }
            },

        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível cadastrar. " + body.errors);
                res.redirect('/');
            } else {
                req.flash("success", "Associado atualizado.");
                if(req.body.status == 'PRE_CADASTRADO'){
                    res.redirect('/app/' + rota + '/pre-cadastro');
                    return true;
                }else{
                    res.redirect('/app/' + rota + '/list');
                    return true;
                } 
            }            
        });
    })


    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.body.id,
                method: "DELETE",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não excluído. " + body.errors);
                    res.redirect('/');
                } else {
                    req.flash("success", "Item excluído com sucesso.");
                    if(req.body.status != 'APROVAR'){
                        res.redirect('/app/' + rota + '/pre-cadastro');
                        return true;
                    }else{
                        res.redirect('/app/' + rota + '/list');
                        return true;
                    } 
                }                               
            });

        }
    });

    app.get('/app/' + rota + '/setor/:id', function (req, res) {
        setores = [];
        request({
            url: process.env.API_HOST + "setor/orgao/" + req.params.id,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, function (error, response, body) {
            for (var i = 0; i < Object.keys(body.data).length; i++) {
                const finalarea = {
                    id: body.data[i].id,
                    nome: body.data[i].nome
                };
                setores.push(finalarea);
            }
            res.json(setores);
        });
    });


    // Rota para exibição da View Alterar Senha
    app.get('/app/' + rota + '/alterar-senha', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            res.format({
                html: function () {
                    res.render(rota + '/Alterar-Senha', { IdUser: req.session.IdUser,
                        NomeUser: req.session.NomeUser,
                        NivelUser: req.session.NivelUser,
                        EmailUser: req.session.EmailUser, informacoes: req.session.json, page: rota });
                }
            });


        }
    })

    app.post('/app/' + rota + '/alterar-senha/submit', upload.single('photo'), function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + '/' + req.body.id + '/alterar-senha',
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token,
                    'teste': 'TESTE'
                },
                form: {
                    senhaAtual: req.body.senhaAtual,
                    novaSenha: req.body.novaSenha
                }
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não atualizado. " + body.errors);
                } else {
                    req.flash("success", "Item atualizado com sucesso.");
                }

                res.redirect('/app/' + rota + '/Alterar-Senha');
                return true;
            });
        }
    });

    app.get('/app/' + rota + '/doc/:id', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
             /*   if (response.statusCode != 200) {
                    req.flash("danger", "Item não impresso. " + body.errors);
                } else {
                    req.flash("success", "Item impresso com sucesso.");
                } */

                res.json({anexo_documento: body.data.anexo_documento});    
            });
            
        }
    });



}