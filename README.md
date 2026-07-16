# 📋 Sistema de Gerenciamento de Clientes (CRM)

## 📌 Navegação

* [📋 Sobre o Projeto](#-sobre-o-projeto)
* [🎯 Objetivo](#-objetivo)
* [👤 Ator do Sistema](#-ator-do-sistema)
* [📌 Funcionalidades](#-funcionalidades)
* [📈 Diagrama de Casos de Uso](#-diagrama-de-casos-de-uso)
* [📑 Requisitos Funcionais](#-requisitos-funcionais)
* [⚙️ Requisitos Não Funcionais](#️-requisitos-não-funcionais)
* [🗄️ Modelo de Dados](#️-modelo-de-dados)
* [🖼️ Mockups](#️-mockups)
* [🚀 Fluxo Básico do Sistema](#-fluxo-básico-do-sistema)
* [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
* [📖 Considerações Finais](#-considerações-finais)

---

## 📋 Sobre o Projeto

O Sistema de Gerenciamento de Clientes (CRM) foi desenvolvido para facilitar o controle de clientes, atendimentos e retornos, permitindo que um administrador organize todas as informações em um único sistema.

O projeto tem como objetivo tornar o gerenciamento mais simples, oferecendo cadastro de clientes, histórico de atendimentos, agenda de retornos, dashboard com indicadores, exportação de dados e diversas funcionalidades para organização das informações.

---

## 🎯 Objetivo

Desenvolver um sistema capaz de:

* Cadastrar clientes;
* Registrar históricos de atendimento;
* Organizar os clientes por status;
* Agendar retornos;
* Consultar informações rapidamente;
* Exportar os dados em CSV;
* Apresentar indicadores através de um Dashboard.

---

## 👤 Ator do Sistema

### Administrador

É o único usuário do sistema e possui acesso a todas as funcionalidades:

* Cadastrar clientes;
* Editar clientes;
* Excluir clientes;
* Pesquisar clientes;
* Consultar clientes;
* Registrar histórico;
* Cadastrar agenda de retorno;
* Visualizar retornos pendentes;
* Visualizar lista geral;
* Acessar Dashboard;
* Registrar observações gerais;
* Exportar dados para CSV.

---

## 📌 Funcionalidades

### 👥 Cadastro de Clientes

Permite cadastrar novos clientes contendo:

* Nome completo;
* Telefone;
* E-mail (opcional);
* Cidade;
* Data de cadastro;
* Status do atendimento.

#### Status disponíveis

* Prospecto
* Em andamento
* Aguardando resposta
* Concluído
* Cancelado

### 📝 Histórico de Atendimento

Cada cliente possui um histórico próprio.

Cada anotação contém:

* Data;
* Hora;
* Texto da anotação.

**Exemplo:**

> 02/07/2026 - Cliente solicitou orçamento para instalação elétrica.

Não existe limite de registros.

### 🔍 Busca de Clientes

O sistema permite localizar clientes através de:

* Nome;
* Telefone;
* Cidade;
* Status.

### 📄 Lista Geral

Exibe todos os clientes em uma tabela contendo:

* Nome;
* Telefone;
* Cidade;
* Status;
* Última atualização.

Também possui filtros para visualizar apenas:

* Prospectos;
* Em andamento;
* Concluídos;
* Cancelados.

### 📅 Agenda de Retorno

Permite cadastrar uma data para entrar em contato novamente com um cliente.

Quando a data chegar, o retorno deverá aparecer em destaque para o administrador.

### 📊 Dashboard

A tela inicial apresenta indicadores rápidos:

* Total de clientes;
* Clientes em andamento;
* Clientes concluídos;
* Prospectos;
* Retornos pendentes.

### ✏️ Edição de Clientes

Permite alterar qualquer informação cadastrada do cliente.

### 🗑️ Exclusão de Clientes

Permite remover clientes do sistema.

Antes da exclusão, é exibida uma confirmação para evitar remoções acidentais.

### 📂 Organização dos Clientes

Os clientes são organizados automaticamente:

* Mais recente → Mais antigo.

Também é possível ordenar por:

* Nome;
* Status;
* Data de cadastro.

### 📌 Observações Gerais

Cada cliente possui um campo independente do histórico para armazenar informações permanentes.

Exemplos:

* Endereço;
* Forma de pagamento;
* Preferências;
* Informações importantes.

### 📤 Exportação CSV

Permite exportar toda a lista de clientes para um arquivo CSV compatível com:

* Microsoft Excel;
* LibreOffice Calc;
* Google Sheets.

---

## 📈 Diagrama de Casos de Uso

O sistema possui um único ator (**Administrador**) responsável por todas as operações.

### Casos de Uso

<img width="863" height="511" alt="image" src="https://github.com/user-attachments/assets/43fa8e0a-a60d-4a02-b076-1bb9093e5f6b" />


---

## 📑 Requisitos Funcionais

| Código | Descrição                                |
| ------ | ---------------------------------------- |
| RF01   | Permitir cadastrar clientes.             |
| RF02   | Permitir editar clientes.                |
| RF03   | Permitir excluir clientes.               |
| RF04   | Solicitar confirmação antes da exclusão. |
| RF05   | Permitir pesquisar clientes.             |
| RF06   | Exibir lista geral dos clientes.         |
| RF07   | Exibir Dashboard com indicadores.        |
| RF08   | Exportar clientes em CSV.                |
| RF09   | Registrar histórico de atendimento.      |
| RF10   | Agendar retorno para clientes.           |
| RF11   | Registrar observações gerais.            |
| RF12   | Consultar informações de um cliente.     |
| RF13   | Visualizar retornos pendentes.           |

---

## ⚙️ Requisitos Não Funcionais

| Código | Descrição                                                            |
| ------ | -------------------------------------------------------------------- |
| RNF01  | Interface simples e intuitiva.                                       |
| RNF02  | Tempo de resposta de até 2 segundos.                                 |
| RNF03  | Armazenamento seguro dos dados.                                      |
| RNF04  | Validação dos campos obrigatórios.                                   |
| RNF05  | Exportação CSV compatível com Excel e LibreOffice.                   |
| RNF06  | Integridade dos dados nas operações de cadastro, edição e exclusão.  |
| RNF07  | Registro correto de data e hora dos históricos e agendamentos.       |
| RNF08  | Compatibilidade com Google Chrome, Microsoft Edge e Mozilla Firefox. |
| RNF09  | Disponibilidade durante o horário de utilização.                     |
| RNF10  | Acesso restrito ao Administrador.                                    |

---

## 🗄️ Modelo de Dados

O sistema foi modelado utilizando:

* DER (Diagrama Entidade-Relacionamento);
* Diagrama de Casos de Uso (UML).

### DER

<img width="869" height="401" alt="image" src="https://github.com/user-attachments/assets/2b9b3386-84d3-40b6-b792-ba6c9490ed9e" />


## 🖼️ Mockups

Nesta seção serão apresentados os protótipos das principais telas do sistema.

### Logo

<img width="798" height="445" alt="image" src="https://github.com/user-attachments/assets/406fe542-48ee-465a-8efa-8eb4f1e8517a" />


### Tela de Login

<img width="791" height="422" alt="image" src="https://github.com/user-attachments/assets/481df35f-0f54-479f-ad70-6ee362029543" />


### Painel Inicial

<img width="1362" height="630" alt="image" src="https://github.com/user-attachments/assets/3be4baae-5d5f-4bb9-89a0-ee7d839a6075" />



### Clientes

<img width="801" height="445" alt="image" src="https://github.com/user-attachments/assets/9172ff23-67ca-47ad-b013-289efc2c3f9c" />

### Agenda de Retorno

<img width="797" height="438" alt="image" src="https://github.com/user-attachments/assets/c087a485-89fb-40d9-8f11-c80c2d6a64d1" />

### Menu Lateral

<img width="785" height="439" alt="image" src="https://github.com/user-attachments/assets/9d098486-333b-437e-9fcc-5cf35fb178ae" />

---

## 🚀 Fluxo Básico do Sistema

1. O administrador acessa o sistema.
2. Cadastra um cliente.
3. Registra o histórico do atendimento.
4. Adiciona observações gerais.
5. Agenda um retorno, quando necessário.
6. Consulta ou pesquisa clientes.
7. Edita informações sempre que necessário.
8. Exclui clientes com confirmação.
9. Visualiza indicadores no Dashboard.
10. Exporta os dados para CSV.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi modelado utilizando:

* Astah Community (Diagrama de Casos de Uso);
* brModelo (DER);
* UML;
* Banco de Dados Relacional (MySQL ou PostgreSQL);
* Java (Back-end);
* Java Swing ou JavaFX (Interface Desktop) **ou** HTML, CSS e JavaScript (Interface Web).

---

## 📖 Considerações Finais

O Sistema de Gerenciamento de Clientes foi projetado para oferecer uma solução simples, organizada e eficiente para o controle de clientes e atendimentos. Com funcionalidades como cadastro, histórico, agenda de retornos, dashboard e exportação em CSV, o sistema facilita o acompanhamento das atividades do administrador e melhora a organização das informações, proporcionando maior produtividade e segurança no gerenciamento dos dados.
