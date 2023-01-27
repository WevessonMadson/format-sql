function getKeys(sql) {
    try {
        const initialIndex = sql.indexOf("(") + 1;
        const finalIndex = sql.indexOf(")");

        const keys = sql.substring(initialIndex, finalIndex).split(",").map(element => element.trim());

        return keys;

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique no console.";
    }
}

function getValues(sql) {
    try {
        const initialIndex = sql.lastIndexOf("(") + 1;
        const finalIndex = sql.lastIndexOf(")");

        const values = sql.substring(initialIndex, finalIndex).split(",").map(element => element.trim().replace(/[",',]/g, ""));

        return values;

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique no console.";
    }
}

function getObjectSql(keys, values) {
    try {
        let objectData = {};

        for (let i = 0; i < keys.length; i++) {
            objectData[keys[i]] = values[i];
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
            let keys = getKeys(sql);
            let values = getValues(sql);

            if (keys.length != values.length) {
                return `A quantidade de chaves (campos) é diferente da quantidade de valores, verifique.`;
            } else {
                return getObjectSql(keys, values);
            }
        }

    } catch (error) {
        console.log(error);

        return "Ocorreu um erro inesperado, verifique no console.";
    }
}




document.getElementById("gerar").addEventListener("click", (e) => {
    e.preventDefault();

    const sql = document.getElementById("textSql").value;
    const result = document.getElementById("result");

    const objectFormated = getFormatSql(sql);

    result.style.display = "block";

    if (typeof objectFormated == "string") {
        result.innerHTML = `
    <div id='erroMsg'>
        <span class="material-icons">warning</span>
        <p>${objectFormated}</p>
    </div>`;

        return;
    } else {
        let dataTable = "";
        for (key in objectFormated) {
            dataTable += `<tr><td>${key}</td><td>${objectFormated[key]}</td></tr>`;
        }

        result.innerHTML = `
    <table id='customers'>
        <thead>
            <tr>
                <th>Campo</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
            ${dataTable}
        </tbody>
    </table>`;
    }
});