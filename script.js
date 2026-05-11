
function toggleMenu(){

    document
    .getElementById("sidebar")
    .classList
    .toggle("active");
}

function goToStep(step){

    i = step;

    show();

    document
    .getElementById("sidebar")
    .classList
    .remove("active");
}

let i = 0;

const steps = document.querySelectorAll(".step");

const submitBtn = document.querySelector(".submit");

const nextBtn = document.querySelector(".next");

const prevBtn = document.querySelector(".prev");

const okBox = document.getElementById("ok");

function show(){

    steps.forEach((s, idx)=>{

        s.classList.toggle(
            "active",
            idx === i
        );

    });

    prevBtn.style.visibility =
        i === 0
        ? "hidden"
        : "visible";

    nextBtn.style.display =
        i === steps.length - 1
        ? "none"
        : "inline-block";

    submitBtn.style.display =
        i === steps.length - 1
        ? "block"
        : "none";
}

function next(){

    if(i < steps.length - 1){

        i++;

        show();
    }
}

function prev(){

    if(i > 0){

        i--;

        show();
    }
}

show();

function fileToBase64(file){

    return new Promise((resolve, reject)=>{

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = ()=>{

            resolve(reader.result);
        };

        reader.onerror = error=>{

            reject(error);
        };
    });
}

async function enviarFormulario(){

  const form = document.getElementById("form");

if (!form.checkValidity()) {

    // ativa destaque vermelho
    form.classList.add("form-enviado");

    irParaPrimeiroErro(form);

    form.reportValidity();

    return;
}
    okBox.style.display = "block";

    okBox.style.background = "#fff3cd";

    okBox.style.color = "#856404";

    okBox.innerHTML = "⏳ Enviando formulário...";

    submitBtn.disabled = true;

    submitBtn.innerHTML = "Enviando...";

    try{

        const form =
        document.getElementById("form");

        const formData =
        new FormData(form);

        const jsonData = {};

        for(const [key, value] of formData.entries()){

            if(value instanceof File){

                if(value.name !== ""){

                    const base64 =
                    await fileToBase64(value);

                    jsonData[key] = {

                        nomeArquivo:value.name,

                        tipoArquivo:value.type,

                        tamanhoArquivo:value.size,

                        base64:base64
                    };
                }

            }else{

                jsonData[key] = value;
            }
        }
      const { jsPDF } = window.jspdf;
const pdf = new jsPDF();

let y = 35;

// ===== CABEÇALHO =====
pdf.setFont("helvetica", "bold");
pdf.setFontSize(14);

pdf.text("MINISTÉRIO PÚBLICO", 105, 12, { align: "center" });
pdf.text("RELATÓRIO DE INSPEÇÃO CARCERÁRIA", 105, 19, { align: "center" });

pdf.setFontSize(10);
pdf.setFont("helvetica", "normal");
pdf.text("Documento gerado automaticamente pelo sistema", 105, 25, { align: "center" });

pdf.line(10, 28, 200, 28);

// ===== SEÇÕES =====
const secoes = {
    "1. IDENTIFICAÇÃO": ["membro_responsavel"],
    "2. UNIDADE": ["estabelecimento","endereco","municipio","telefone","responsavel","cargo"],
    "3. VISITA": ["data_visita","acompanhou","quem_acompanhou","cargo_acompanhante"],
    "4. FUNCIONAMENTO": ["capacidade","total_presos","provisorios","definitivos"],
    "5. ROTINAS": ["banho_sol","visita_familiar","visita_intima","educacao","trabalho"],
    "6. SEGURANÇA": ["video","revista","visitantes","tornozeleira"],
    "7. ALIMENTAÇÃO": ["refeicoes","terceirizado","reclamacoes","quais_reclam"],
    "8. INSTALAÇÕES": ["ventilacao","iluminacao","agua","limpeza","esgoto"],
    "9. AUDIÊNCIA": ["audiencia","violacao","sigilo","impo"],
    "10. CONCLUSÃO": ["necessidades","consideracoes"]
};

// ===== TABELA =====
function tabela(titulo, campos) {

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);

    pdf.text(titulo, 14, y);
    y += 4;

    pdf.line(10, y, 200, y);
    y += 5;

    const body = [];

    campos.forEach(key => {

        if (!jsonData[key]) return;

        let valor = jsonData[key];

        if (typeof valor === "object") {
            valor = JSON.stringify(valor);
        }

        body.push([
            key,
            valor
        ]);
    });

    pdf.autoTable({
        startY: y,
        head: [["Campo", "Resposta"]],
        body: body,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [11, 94, 215], textColor: 255 },
        margin: { left: 10, right: 10 },

        didDrawPage: function (data) {
            y = data.cursor.y + 5;
        }
    });
}

// ===== GERAR =====
for (const secao in secoes) {
    tabela(secao, secoes[secao]);
}



// ===== DOWNLOAD =====
pdf.save("relatorio-inspecao.pdf");

// ================= FIM PDF =================

        console.log(jsonData);

        const response = await fetch(

            "https://default84a9248e396f44df84a94379e11007.ab.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/1552ec21b75e4a91a8efe46646df29cd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FM0vBZ2DznnnXSaICrqcIeeIRayGG94EzZSCnsjztp0",

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(jsonData)
            }
        );

        let resposta = "";

        try{

            resposta =
            await response.text();

        }catch{

            resposta =
            "Sem resposta do servidor.";
        }

        if(response.ok){

            okBox.style.background =
            "#d1e7dd";

            okBox.style.color =
            "#0f5132";

            okBox.innerHTML = `

                <h3>
                    ✔ Formulário enviado com sucesso
                </h3>

                <strong>Status:</strong>
                ${response.status}

                <br><br>

                <strong>Resposta:</strong>

                <pre>
${resposta}
                </pre>
            `;

            form.reset();

            i = 0;

            show();

        }else{

            okBox.style.background =
            "#f8d7da";

            okBox.style.color =
            "#842029";

            okBox.innerHTML = `

                <h3>
                    ❌ Erro ao enviar
                </h3>

                <strong>Status:</strong>
                ${response.status}

                <br><br>

                <strong>Resposta:</strong>

                <pre>
${resposta}
                </pre>
            `;
        }

    }catch(error){

        okBox.style.background =
        "#f8d7da";

        okBox.style.color =
        "#842029";

        okBox.innerHTML = `

            <h3>
                ❌ Erro de conexão
            </h3>

            ${error.message}
        `;
    }

    submitBtn.disabled = false;

    submitBtn.innerHTML = "Enviar";

    function irParaPrimeiroErro(form) {

    const invalid = form.querySelector(":invalid");

    if (!invalid) return false;

    const step = invalid.closest(".step");

    if (step) {

        const steps = document.querySelectorAll(".step");

        steps.forEach((s, idx) => {

            if (s === step) {

                i = idx; // usa sua variável global
                show();
            }
        });
    }

    invalid.focus();

    return true;
}
}


function mascaraTelefone(input) {
    let v = input.value.replace(/\D/g, ''); // remove tudo que não é número

    // celular (11 dígitos): (99) 99999-9999
    if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } 
    // fixo (10 dígitos): (99) 9999-9999
    else {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    }

    input.value = v;
}

function obrigarCampoQuandoSim(simRadio, naoRadio, campo) {

    function atualizar() {

        if (simRadio.checked) {
            campo.required = true;
            campo.placeholder = "Campo obrigatório";
            campo.style.border = "2px solid #dc3545";
        } else {
            campo.required = false;
            campo.placeholder = "";
            campo.style.border = "1px solid #ccc";
            campo.value = "";
        }
    }

    simRadio.addEventListener("change", atualizar);
    naoRadio.addEventListener("change", atualizar);

    atualizar(); // inicializa
}

// 👇 chamadas ficam FORA da função
obrigarCampoQuandoSim(
    document.getElementById("sep_sim"),
    document.getElementById("sep_nao"),
    document.getElementById("razao")
);

obrigarCampoQuandoSim(
    document.getElementById("reclam_sim"),
    document.getElementById("reclam_nao"),
    document.getElementById("quais")
);

obrigarCampoQuandoSim(
    document.getElementById("torno_sim"),
    document.getElementById("torno_nao"),
    document.getElementById("justificativa")
);
obrigarCampoQuandoSim(
    document.getElementById("fuga_sim"),
    document.getElementById("fuga_nao"),
    document.getElementById("fuga_detalhes")
);



const inputFile = document.getElementById("foto");

inputFile.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB em bytes

    if (file.size > maxSize) {

        alert("Arquivo muito grande! Máximo permitido: 10MB");

        this.value = ""; // limpa o campo
    }
});