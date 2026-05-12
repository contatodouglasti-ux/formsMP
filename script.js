
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
}
);


const dados = [
  { municipio: "Boa Vista do Ramos", endereco: "Estrada Presidente Figueiredo, s/n, Bairro Monte Sião, CEP 69220-472" },
  { municipio: "Canutama", endereco: "Rua João Pontes, s/n, bairro São Francisco" },
  { municipio: "Uarini", endereco: "Av. Franco Lopes, s/n, Centro" },
  { municipio: "Boca do Acre", endereco: "Avenida 13, Conjunto Shan" },
  { municipio: "Manaquiri", endereco: "Rua 3, S/nº, Bairro Novo, CEP 69435-000" },
  { municipio: "Maués", endereco: "Estrada do Guaranatuba, S/N" },
  { municipio: "Maraã", endereco: "Rua do Aeroporto, Benedito Ramos" },
  { municipio: "Amaturá", endereco: "Rua São Francisco, 1166, Bairro São Francisco" },
  { municipio: "Jutaí", endereco: "Rua 6 de Fevereiro, São Francisco" },
  { municipio: "Autazes", endereco: "Estrada AZ1, S/N, Bairro Jair Menezes Tupinambá" },
  { municipio: "Rio Preto da Eva", endereco: "Rua Domingos Monteiro, s/n, Centro" },
  { municipio: "Santo Antônio do Içá", endereco: "Avenida Presidente Médici, 55, Campinas II" },
  { municipio: "Santa Isabel do Rio Negro", endereco: "Avenida Rio Negro, nº 76, Centro" },
  { municipio: "São Paulo de Olivença", endereco: "Rua Prudêncio Andion, s/n, bairro Campinas" },
  { municipio: "Ipixuna", endereco: "Rua Leland Barroso, 372, Centro" },
  { municipio: "Fonte Boa", endereco: "Rua Tertuliano Rodrigues, S/N, Centro" },
  { municipio: "Eirunepé", endereco: "Estrada do Xidá, Bairro Nossa Senhora de Fátima" },
  { municipio: "Apuí", endereco: "Avenida 13 de Novembro, S/N, Centro" },
  { municipio: "Envira", endereco: "Av. Joaquim Borba, S/Nº, Centro" },
  { municipio: "Lábrea", endereco: "Rua 24 de Agosto, S/N, Vila Falcão" },
  { municipio: "Anamã", endereco: "Rua Álvaro Maia, 560, Centro" },
  { municipio: "Borba", endereco: "Estrada do Aeroporto, 457, Bairro Cristo Rei" },
  { municipio: "Barreirinha", endereco: "Rua Maria Belém, s/n, Bairro Ulisses Guimarães" },
  { municipio: "Nova Olinda do Norte", endereco: "Rua Coronel Janary Nunes, s/n, Centro" },
  { municipio: "Japurá", endereco: "Av. Raimundo Cruz, s/n, Centro" },
  { municipio: "Nhamundá", endereco: "Rua Governador Plínio Ramos Coelho, 153" },
  { municipio: "Atalaia do Norte", endereco: "Rua Raimundo Gimaque, Centro" },
  { municipio: "Itapiranga", endereco: "Rua Urucurituba, nº 122, Centro" },
  { municipio: "Silves", endereco: "Avenida Governador Eduardo Braga, s/n, Panorama" },
  { municipio: "Tapauá", endereco: "Rua Raimundo Jó de Andrade, s/n, Bairro Açaí" },
  { municipio: "Manicoré", endereco: "Av. Santos Dumont, S/N, Bairro Centro" },
  { municipio: "São Sebastião do Uatumã", endereco: "Rua do Conjunto, 185" },
  { municipio: "Itacoatiara", endereco: "Ramal do Canaçari, Km 6,5, s/nº - AM 010" },
  { municipio: "São Gabriel da Cachoeira", endereco: "Rua 04, nº103, Bairro Dabaru" },
  { municipio: "Barcelos", endereco: "Rua Efigênio Sales, s/nº" },
  { municipio: "Presidente Figueiredo", endereco: "Avenida Padre Calleri, 233, Tancredo Neves" },
  { municipio: "Urucurituba", endereco: "Estrada do Arrozal, s/n" },
  { municipio: "Parintins", endereco: "Av. Nações Unidas, nº 1842, Bairro Centro" },
  { municipio: "Novo Aripuanã", endereco: "Estrada NAP 01, s/n° - Bairro da TV" },
  { municipio: "Coari", endereco: "Rua Jonatatas Pedrosa, s/n, Bairro Santa Efigênia" },
  { municipio: "Tefé", endereco: "Estrada da Agrovila, KM 05" },
  { municipio: "Alvarães", endereco: "Estrada Alvarães Nogueira, nº 970, São Francisco" },
  { municipio: "Codajás", endereco: "Rua 05 de Setembro, s/n, Centro" },
  { municipio: "Juruá", endereco: "Rua Angel Lopes Cabado, nº 16, Bairro São Francisco" },
  { municipio: "Novo Airão", endereco: "Rua Ajuricaba, s/n, Nova Esperança" },
  { municipio: "Caapiranga", endereco: "Avenida Valdomiro Morais de Castro, s/n, Bairro São Geraldo" },
  { municipio: "Pauini", endereco: "Estrada PNI 002, Bairro Fortaleza" },
  { municipio: "Itamarati", endereco: "Rua Albertina Lisboa, s/n" },
  { municipio: "Careiro da Várzea", endereco: "Rua Miracauera, Centro" },
  { municipio: "Humaitá", endereco: "Rua Padre José Maria Pena, 1639, São Pedro" },
  { municipio: "Tabatinga", endereco: "Rua Manoel Tananta, s/n, Santa Rosa" },
  { municipio: "Beruri", endereco: "Rua Getulio Vargas, 23, São Pedro" },
  { municipio: "Anori", endereco: "Avenida 31 de Março, 344, Bairro Centro" },
  { municipio: "Manacapuru", endereco: "Avenida Almirante Tamandaré, 3000" },
  { municipio: "Urucará", endereco: "Rua Major Lobato Mendes, s/n, Santa Luzia" },
  { municipio: "Guajará", endereco: "Avenida Getúlio Vargas, 282, Centro" },
  { municipio: "Carauari", endereco: "Juscelino Kubitscheck, nº 530, Nova República" },
  { municipio: "Careiro", endereco: "Rua Arajá, s/nº, Bairro Vista Alegre" }
];
const datalistMunicipios = document.getElementById("listaMunicipios");
const inputMunicipio = document.getElementById("municipio");
const inputEndereco = document.getElementById("endereco");

// ordena
dados.sort((a, b) => a.municipio.localeCompare(b.municipio));

// popula datalist
dados.forEach(item => {
  const option = document.createElement("option");
  option.value = item.municipio;
  datalistMunicipios.appendChild(option);
});

// melhor evento (mais confiável que blur)


inputMunicipio.addEventListener("input", () => {

  const item = dados.find(d =>
    d.municipio.toLowerCase() === inputMunicipio.value.toLowerCase().trim()
  );

  if (item) {
    inputEndereco.value = item.endereco;
    inputEndereco.readOnly = true; // trava só quando é conhecido
  } else {
    inputEndereco.value = "";
    inputEndereco.readOnly = false; // libera novo endereço
  }
});

const usuarios = [
{ nome: "Kyara Trindade Barbosa", email: "kyarabarbosa@mpam.mp.br" },
{ nome: "Maria Cynara Rodrigues Cavalcante", email: "mariarodrigues@mpam.mp.br" },
{ nome: "Christian Anderson Ferreira da Gama", email: "christiangama@mpam.mp.br" },
{ nome: "Marcos Patrick Sena Leite", email: "marcosleite@mpam.mp.br" },
{ nome: "Caio Lúcio Fenelon Assis Barros", email: "caiobarros@mpam.mp.br" },
{ nome: "Aramis Pereira Júnior", email: "aramisjunior@mpam.mp.br" },
{ nome: "Marcos Túlio Pereira Correia Júnior", email: "marcoscorreia@mpam.mp.br" },
{ nome: "Suelen Shirley Rodrigues da Silva Oliveira", email: "suelenoliveira@mpam.mp.br" },
{ nome: "Matheus de Oliveira Santana", email: "matheusoliveira@mpam.mp.br" },
{ nome: "Carlos Firmino Dantas", email: "taianamatos@mpam.mp.br" },
{ nome: "Adriana Monteiro Espinheira", email: "adrianaespinheira@mpam.mp.br" },
{ nome: "Túlio Teixeira Pinheiro", email: "tuliopinheiro@mpam.mp.br" },
{ nome: "Taize Moraes Siqueira", email: "taizesiqueira@mpam.mp.br" },
{ nome: "José Ricardo Moraes da Silva", email: "josemoraes@mpam.mp.br" },
{ nome: "Cláudio Moisés Rodrigues Pereira", email: "carloscipriano@mpam.mp.br" },
{ nome: "Lucas Souza Pinha", email: "lucaspinha@mpam.mp.br" },
{ nome: "Christian Guedes da Silva", email: "christiansilva@mpam.mp.br" },
{ nome: "Elison Nascimento da Silva", email: "elisonsilva@mpam.mp.br" },
{ nome: "Alison Almeida Santos Buchacher", email: "alisonbuchacher@mpam.mp.br" },
{ nome: "Anne Caroline Amaral de Lima", email: "anneamaral@mpam.mp.br" },
{ nome: "Emiliana do Carmo Silva", email: "emilianasilva@mpam.mp.br" },
{ nome: "Ana Carolina Arruda Vasconcelos", email: "anavasconcelos@mpam.mp.br" },
{ nome: "Dimaikon Dellon Silva do Nascimento", email: "dimaikonnascimento@mpam.mp.br" },
{ nome: "Fábia Melo Barbosa de Oliveira", email: "fabiaoliveira@mpam.mp.br" },
{ nome: "Bruno Batista da Silva", email: "brunobsilva@mpam.mp.br" },
{ nome: "Venâncio Antônio Castilhos de Freitas Terra", email: "venancioterra@mpam.mp.br" },
{ nome: "Míriam Figueiredo da Silveira", email: "miriamsilveira@mpam.mp.br" },
{ nome: "Paulo Alexander dos Santos Beriba", email: "pauloberiba@mpam.mp.br" },
{ nome: "Taina dos Santos Madela", email: "tainamadela@mpam.mp.br" },
{ nome: "Kleyson Nascimento Barroso", email: "kleysonbarroso@mpam.mp.br" },
{ nome: "Ricardo Mitoso Nogueira Borges", email: "ricardoborges@mpam.mp.br" },
{ nome: "Jéssica Vitoriano Gomes", email: "jessicavitoriano@mpam.mp.br" },
{ nome: "Yury Dutra da Silva", email: "yurydutra@mpam.mp.br" },
{ nome: "Gustavo Van Der Laars", email: "ulissessilva@mpam.mp.br" },
{ nome: "Carlos Firmino Dantas", email: "rogerpereira@mpam.mp.br" },
{ nome: "Rafael Augusto Del Castillo da Fonseca", email: "rafaelfonseca@mpam.mp.br" },
{ nome: "João Ribeiro Guimarães Netto", email: "adautojunior@mpam.mp.br" },
{ nome: "Marcos Patrick Sena Leite", email: "camilagomes@mpam.mp.br" },
{ nome: "Ney Costa Alcântara de Oliveira Filho", email: "neyoliveira@mpam.mp.br" },
{ nome: "Weslei Machado", email: "victorinacio@mpam.mp.br" },
{ nome: "Jarla Ferraz Brito", email: "jarlabrito@mpam.mp.br" },
{ nome: "Miguel Ângelo da Silva Ribeiro", email: "miguelribeiro@mpam.mp.br" },
{ nome: "Marcelo dos Anjos de Castro", email: "marcelocastro@mpam.mp.br" },
{ nome: "Sandro Crispim Gonçalves Nóbrega Magalhães", email: "sandromagalhaes@mpam.mp.br" },
{ nome: "João Ricardo Fonseca e Lima Tisse Garcia", email: "joaogarcia@mpam.mp.br" },
{ nome: "Lucas Donato Primo Costa", email: "lucascosta@mpam.mp.br" },
{ nome: "Violeta Núbia Melo Barbosa de Oliveira", email: "violetaoliveira@mpam.mp.br" }
];


const datalistUsuarios = document.getElementById("listaNomes");
const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");

usuarios.forEach(u => {
  const option = document.createElement("option");
  option.value = u.nome;
  datalistUsuarios.appendChild(option);
});

inputNome.addEventListener("input", () => {
  const usuario = usuarios.find(u =>
    u.nome.toLowerCase() === inputNome.value.toLowerCase().trim()
  );

  if (usuario) {
    inputEmail.value = usuario.email;
    inputEmail.readOnly = true;
  } else {
    inputEmail.value = "";
    inputEmail.readOnly = false;
  }
});