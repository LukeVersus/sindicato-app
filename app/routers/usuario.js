require('dotenv').config();
const request = require('request');
const base64Img = require('base64-img');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
const fs = require('fs');
var multer = require('multer');
var upload = multer();

let nivel;
let lista = [];
let username;
let imagem;
let finallista = {};
let json = {};
let teste;
//const Array = require('array');
//export const list2 = "teste";


module.exports = async function (app) {

    app.use(cookieParser());
    app.use(session({ secret: "2C44-4D44-WppQ38S" }));

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
            if (!req.session.token) {
                res.redirect('/app/login');
            } else if (NivelUser != 'ADMIN') {
                res.redirect('/');
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
                            username: body.data.content[i].username,
                            niveis: body.data.content[i].niveis,
                            ativo: body.data.content[i].ativo,
                            bloqueado: body.data.content[i].bloqueado,
                            expirado: body.data.content[i].expirado,
                            habilitado: body.data.content[i].habilitado,
                            telefone: body.data.content[i].telefone,
                            email: body.data.content[i].email

                        };
                        lista.push(finallista);

                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/List', { itens: lista, page: rota, informacoes: req.session.json, number: body.data.number, totalPages: body.data.totalPages });
                        }
                    });
                    return lista;
                });
            }
        }
    });

    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            res.format({
                html: function () {
                    res.render(rota + '/Create', { page: rota });
                }
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {
        
        request({
            url: process.env.API_HOST + rota,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "nome": req.body.nome,
                "username": req.body.username,
                "password": req.body.password,
                "niveis": [req.body.niveis],
                "ativo": req.body.ativo,
                "habilitado": true,
                "expirado": false,
                "bloqueado": false,
                "telefone": req.body.telefone,                
                "email": req.body.email
            },

        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível cadastrar. " + body.errors);
                res.redirect('/');
            } else {
                req.flash("success", "Associado cadastrado.");
                if(req.body.status == 'PRE_CADASTRADO'){
                    res.redirect('/app/' + rota + '/pre-cadastro');
                    return true;
                }else{
                    res.redirect('/app/' + rota + '/list');
                    return true;
                } 
            }            
        });
    });
    
    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {

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
                    username = body.data.username;
                    res.format({
                        html: function () {
                            res.render(rota + '/Edit', {
                            id: body.data.id,
                            nome: body.data.nome,
                            username: body.data.username,
                            password: body.data.password,
                            niveis: body.data.niveis,
                            page: rota,
                            ativo: body.data.ativo,
                            telefone: body.data.telefone,
                            email: body.data.email,
                            informacoes: req.session.json
                        });
                    }
                });
                nivel = NivelUser
                username = body.data.username;
                imagem = body.data.imgCapa;
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {

        request({
            url: process.env.API_HOST + rota,
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.body.id,
                "nome": req.body.nome,
                "username": username,
                "niveis": [req.body.niveis],
                "telefone": req.body.telefone,
                "email": req.body.email,
                "ativo": req.body.ativo,
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível alterar o item. " + body.errors);
            } else {
                req.flash("success", "Item alterado com sucesso.");
            }

            res.redirect('/app/' + rota + '/list');
            return true;
        });

    });

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
                } else {
                    req.flash("success", "Item excluído com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });

        }
    });


    // Rota para exibição da View Perfil
    app.get('/app/' + rota + '/perfil', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');

        } else {
            request({
                url: process.env.API_HOST + rota + "/" + IdUser,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                res.format({
                    html: function () {
                        res.render(rota + '/Perfil', {
                            id: body.data.content.id,
                            nome: body.data.content.nome,
                            username: body.data.content.username,
                            password: body.data.content.password,
                            page: rota,
                            ativo: body.data.content.ativo,
                            habilitado: body.data.content.habilitado,
                            expirado: body.data.content.expirado,
                            bloqueado: body.data.content.bloqueado,
                            telefone: body.data.content.telefone,                            
                            email: body.data.content.email,
                            informacoes: req.session.json
                        });
                    }
                });
                nivel = body.data.niveis;
                username = body.data.username;
                imagem = body.data.imgCapa;
            });
        }
    });

    // Rota para receber parametros via post editar perfil
    app.post('/app/' + rota + '/perfil/submit', upload.single('photo'), function (req, res) {


        request({
            url: process.env.API_HOST + rota,
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.body.id,
                "nome": req.body.nome,
                "username": username,
                "niveis": NivelUser,
                "telefone": req.body.telefone,
                "email": req.body.email,
                /*
                "ativo": req.body.ativo,
                "habilitado": req.body.habilitado,
                "expirado": req.body.expirado,
                "bloqueado": req.body.bloqueado
                */
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível alterar o item. " + body.errors);
            } else {
                req.flash("success", "Item alterado com sucesso.");
                NomeUser = body.data.nome;
            }

            res.redirect('/');
            return true;
        });

    });

    app.post('/app/' + rota + '/list', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else if (req.session.usuario.niveis[0] != 'ADMIN') {
            res.redirect('/');
        } else { // " + req.body.size + "
            request({
                url: encodeURI(process.env.API_HOST + rota + "/nome/nivel/" + req.body.page + "/" + req.body.size + "?nome=" + req.body.busca),
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
                            username: body.data.content[i].username,
                            niveis: body.data.content[i].niveis,
                            ativo: body.data.content[i].ativo,
                            telefone: body.data.content[i].telefone, //telefone                            
                            email: body.data.content[i].email

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

    // Rota para exibição da View Alterar Senha
    app.get('/app/' + rota + '/alterar-senha', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            res.format({
                html: function () {
                    res.render(rota + '/Alterar-Senha', {
                        page: rota
                    });
                }
            });
        }
    })

    // Rota para enviar nova senha
    app.post('/app/' + rota + '/alterar-senha/submit', upload.single('photo'), function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/alterar-senha",
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                json: {
                    "id": req.body.id,
                    "password": req.body.senhaAtual,
                    "newPassword": req.body.novaSenha
                }
            }, function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Item não atualizado. " + body.errors);
                    res.redirect("/");
                } else {
                    req.flash("success", "Item atualizado com sucesso.");
                    res.redirect('/app/' + rota + '/Alterar-Senha/' + req.body.id);
                    return true;
                }
            });
        }
    })
}