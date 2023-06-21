/*--- Funções de tratamentos do Sql ---*/

function getFields(sql) {
    try {
        const initialIndex = sql.indexOf("(") + 1;
        const finalIndex = sql.indexOf(")");

        const fields = sql.substring(initialIndex, finalIndex).split(",").map(element => element.trim());

        return fields;

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique os valores passados.";
    }
}

function getValues(sql) {
    try {
        const strSqlNotfields = sql.slice(sql.indexOf("(") + 1);
        const initialIndex = strSqlNotfields.indexOf("(") + 1;
        const finalIndex = strSqlNotfields.lastIndexOf(")");

        const values = strSqlNotfields.substring(initialIndex, finalIndex).split(",").map(element => element.trim().replace(/[",',]/g, ""));
        return values;

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique os valores passados.";
    }
}

function getObjectSql(fields, values, marked) {
    try {
        let objectData = {};

        for (let i = 0; i < fields.length; i++) {
            objectData[fields[i]] = { value: values[i], marked: marked };
        }

        return objectData;

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique os valores passados.";
    }
}

function getFormatSql(sql, marked = true) {
    try {
        let sqlFormated = sql.toLocaleLowerCase();

        if (sqlFormated.indexOf("insert ") == -1 && sqlFormated.indexOf(" into") == -1) {
            return "O sql passado não se trata de um insert ou está escrito incorretamente, verifique.";
        } else {
            let fields = getFields(sql);
            let values = getValues(sql);

            if (fields.length != values.length) {
                return `A quantidade de campos é diferente da quantidade de valores, verifique.`;
            } else {
                return getObjectSql(fields, values, marked);
            }
        }

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique os valores passados.";
    }
}


/*--- Funções de renderização da tabela ---*/
function renderCheckBox() {
    const expande = document.getElementById("expande").textContent === "expand_more" ? true : false;
    const listOfCheckBox = document.getElementsByClassName("checkBox");

    if (expande) {
        for (let i = 0; i < listOfCheckBox.length; i++) {
            listOfCheckBox[i].innerHTML = `<span></span>`;
            document.getElementById("markedAll").innerHTML = `<span></span>`;
        }
    } else {
        for (let i = 0; i < listOfCheckBox.length; i++) {
            listOfCheckBox[i].innerHTML = `<input type='checkbox' onchange='updateMarked()' class='marked' />`;
            document.getElementById("markedAll").innerHTML = `<input id='markAll' type='checkbox' onclick='markAll()'/>`;
        }
    }

}

function expandeOrNot() {
    const expande = document.getElementById("expande").textContent === "expand_more" ? true : false;
    const lastSql = localStorage.getItem("lastSql");

    if(expande) {
        const objectFormated = getFormatSql(lastSql, false);
        localStorage.setItem("objectTable", JSON.stringify(objectFormated));
        document.getElementById("expande").textContent = "expand_less";
    } else {
        const objectFormated = getFormatSql(lastSql, true);
        localStorage.setItem("objectTable", JSON.stringify(objectFormated));
        document.getElementById("expande").textContent = "expand_more";
    }
    
    renderCheckBox();
}

function updateMarked() {
    const trs = document.getElementsByClassName('trTableValue');
    const objectTable = JSON.parse(localStorage.getItem("objectTable"));

    for (let i = 0; i < trs.length; i++) {
        let key = trs[i].getElementsByClassName('key')[0].innerText;
        let marked = trs[i].getElementsByClassName('checkBox')[0].getElementsByClassName('marked')[0].checked;
        objectTable[key].marked = marked;
    }

    localStorage.setItem("objectTable", JSON.stringify(objectTable));
}

function markAll() {
    const trs = document.getElementsByClassName('trTableValue');
    const markedAll = document.getElementById("markAll");
    if (markedAll.checked) {
        for (let i = 0; i < trs.length; i++) {
            trs[i].getElementsByClassName('checkBox')[0].getElementsByClassName('marked')[0].checked = true;
        }
    } else {
        for (let i = 0; i < trs.length; i++) {
            trs[i].getElementsByClassName('checkBox')[0].getElementsByClassName('marked')[0].checked = false;
        }
    }

    updateMarked();
}

function renderTable(dataTables) {
    return `
    <div id='busca'>
        <input type='text' placeholder='filtrar campo' id='pesquisar' oninput='searchFields()'>
        <button id='limpar' title='Limpar Filtro' onclick='clearFilter()'><span class="material-icons">clear</span></button>
        <button id='gerarNewInsert' title='Gerar Novo Insert' onclick='getNewInsert()'><span class="material-icons">content_copy</span></button>
    </div>    
    <table id='customers'>
        <thead>
            <tr>
                <th class='no-style-table'><div id='expandeMarked'><span id ='markedAll'><span></span></span><span class='material-icons' id='expande' onclick='expandeOrNot()'>expand_more</span></div></th>
                <th>CAMPO</th>
                <th>VALOR</th>
            </tr>
        </thead>
        <tbody>
            ${dataTables}
        </tbody>
    </table>`;
}

function createTrTable(key, value) {
    return `<tr class='trTableValue'><td class='checkBox no-style-table'><span></span></td><td class='key'>${key}</td><td class='value'><input class='inputValue' type='text' value='${value}'></td></tr>`
}

function renderReturn(e) {
    e.preventDefault();

    const sql = document.getElementById("textSql");
    const result = document.getElementById("result");

    const objectFormated = getFormatSql(sql.value);

    result.style.display = "block";

    if (typeof objectFormated == "string") {
        result.innerHTML = `
    <div id='erroMsg'>
        <span class="material-icons">warning</span>
        <p>${objectFormated}</p>
    </div>`;

        return;
    } else {
        localStorage.setItem("objectTable", JSON.stringify(objectFormated));
        localStorage.setItem("lastSql", sql.value);

        let dataTable = "";

        for (key in objectFormated) {
            dataTable += createTrTable(key, objectFormated[key].value);
        }

        result.innerHTML = renderTable(dataTable);

        renderCheckBox();

        document.getElementById("result").firstElementChild.scrollIntoView();
    }
}

/*--- Funções de Dark-Mode ---*/

function darkMode(e) {
    e.preventDefault();

    const button_dark = document.querySelector("#dark-mode");
    const html = document.querySelector("html");

    html.classList.toggle("dark-mode");

    if (button_dark.innerText == "light_mode") {
        button_dark.innerText = "dark_mode"
        localStorage.setItem("dark", "dark_mode");
    } else {
        button_dark.innerText = "light_mode"
        localStorage.setItem("dark", "light_mode");
    }
}

function reloadDarkMode() {
    let dark = localStorage.getItem("dark") || "light_mode";

    document.querySelector("#dark-mode").innerText = dark;

    if (dark == "dark_mode") {
        document.querySelector("html").classList.toggle("dark-mode");
    }
}

/*--- Funções dos filtros ---*/

function searchFields() {
    const objectFormated = JSON.parse(localStorage.getItem("objectTable"));

    let search = document.getElementById("pesquisar").value;

    let dataTable = "";

    if (search != null) {
        if (search.length > 1) {
            for (key in objectFormated) {
                let field = key.toLocaleLowerCase().indexOf(search.toLocaleLowerCase());
                if (field != -1) {
                    dataTable += createTrTable(key, objectFormated[key].value);
                }
            }

            result.innerHTML = renderTable(dataTable);

            document.getElementById("pesquisar").value = search;
        } else if (search == "") {
            clearFilter();
        }

        document.getElementById("result").firstElementChild.scrollIntoView();
        document.getElementById("pesquisar").focus();
    }
}

function clearFilter() {
    const objectFormated = JSON.parse(localStorage.getItem("objectTable"));

    dataTable = "";

    for (key in objectFormated) {
        dataTable += createTrTable(key, objectFormated[key].value);
    }

    result.innerHTML = renderTable(dataTable);
    document.getElementById("result").firstElementChild.scrollIntoView();
}

/*--- Função de resgate do sql ---*/

function getLastInsert(e) {
    e.preventDefault();

    const lastSql = localStorage.getItem("lastSql");

    if (lastSql) {
        if (confirm("Clique OK para usar o último SQL.")) {
            document.getElementById("textSql").value = lastSql;
        }
    }
}

/* -- Função para gerar novo insert -- */

async function getNewInsert() {
    const trs = document.getElementsByClassName('trTableValue');

    const objectForNewInsert = JSON.parse(localStorage.getItem("objectTable"));
    const sqlForNewInsert = localStorage.getItem("lastSql");

    for (let i = 0; i < trs.length; i++) {
        let key = trs[i].getElementsByClassName('key')[0].innerText;
        let value = trs[i].getElementsByClassName('value')[0].getElementsByClassName('inputValue')[0].value;

        if (objectForNewInsert[key].marked) {
            objectForNewInsert[key].value = value;
        }
    }

    let newInsert = sqlForNewInsert.substring(0, sqlForNewInsert.indexOf('(') - 1);
    let preFields = '(';
    let preValues = '(';

    for (key in objectForNewInsert) {
        if (objectForNewInsert[key].marked) {
            preFields += `${key}, `;
            if (objectForNewInsert[key].value.toLocaleLowerCase().trim() == 'null') {
                preValues += `${objectForNewInsert[key].value}, `;
            } else {
                preValues += `'${objectForNewInsert[key].value}', `;
            }
        }
    }

    let newFields = `${preFields.substring(0, preFields.length - 2)})`;
    let newValues = `${preValues.substring(0, preValues.length - 2)});`;
    if (preFields === "(") {
        alert("Marque as linhas que deseja acrescentar ao insert ou esconda-os para gerar com todos os campos.");
        return;
    }
    newInsert += ` ${newFields} \nvalues ${newValues}`;

    await navigator.clipboard.writeText(newInsert);

    alert("Novo Insert Copiado para a Area de Transferência.");
}

/* -- eventos de disparos -- */

window.addEventListener("DOMContentLoaded", reloadDarkMode);
document.getElementById("gerar").addEventListener("click", renderReturn);
document.getElementById("dark-mode").addEventListener("click", darkMode);
document.getElementById("textSql").addEventListener("dblclick", getLastInsert);
