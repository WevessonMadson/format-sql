/*--- Funções de tratamentos do Sql ---*/

function getFields(sql) {
    try {
        const initialIndex = sql.indexOf("(") + 1;
        const finalIndex = sql.indexOf(")");

        const fields = sql.substring(initialIndex, finalIndex).split(",").map(element => element.trim());

        return fields;

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique no console.";
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

        return "Ocorreu um erro inesperado, verifique no console.";
    }
}

function getObjectSql(fields, values) {
    try {
        let objectData = {};

        for (let i = 0; i < fields.length; i++) {
            objectData[fields[i]] = values[i];
        }

        return objectData;

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique no console.";
    }
}

function getFormatSql(sql) {
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
                return getObjectSql(fields, values);
            }
        }

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique no console.";
    }
}


/*--- Funções de renderização da tabela ---*/

function renderTable(dataTables) {
    return `
    <div id='busca'>
        <input type='text' placeholder='filtrar campo' id='pesquisar' oninput='searchFields()'>
        <button id='buscar' title='filtrar' onclick='searchFields()'><span class="material-icons">search</span></button>
        <button id='limpar' title='limpar filtro' onclick='clearFilter()'><span class="material-icons">clear</span></button>
    </div>    
    <table id='customers'>
        <thead>
            <tr>
                <th>CAMPO</th>
                <th>VALOR</th>
            </tr>
        </thead>
        <tbody>
            ${dataTables}
        </tbody>
    </table>`;
}

function renderReturn(e) {
    e.preventDefault();

    const sql = document.getElementById("textSql");
    const result = document.getElementById("result");

    const objectFormated = getFormatSql(sql.value);

    result.style.display = "block";
    sql.style.height = "15vh";

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
            dataTable += `<tr><td>${key}</td><td>${objectFormated[key]}</td></tr>`;
        }

        result.innerHTML = renderTable(dataTable);
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
                    dataTable += `<tr><td>${key}</td><td>${objectFormated[key]}</td></tr>`;
                }
            }

            result.innerHTML = renderTable(dataTable);

            document.getElementById("pesquisar").value = search;
        } else if (search == "") {
            clearFilter();
        }
        
        document.getElementById("pesquisar").focus();
    }
}

function clearFilter() {
    const objectFormated = JSON.parse(localStorage.getItem("objectTable"));

    dataTable = "";

    for (key in objectFormated) {
        dataTable += `<tr><td>${key}</td><td>${objectFormated[key]}</td></tr>`;
    }

    result.innerHTML = renderTable(dataTable);
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


window.addEventListener("DOMContentLoaded", reloadDarkMode);
document.getElementById("gerar").addEventListener("click", renderReturn);
document.getElementById("dark-mode").addEventListener("click", darkMode);
document.getElementById("textSql").addEventListener("dblclick", getLastInsert);

