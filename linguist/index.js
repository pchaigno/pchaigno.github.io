// https://obfuscator.io
var ll = new Map();
ll.set(1, ['Rust', 'Brainfuck', 'Beef', 'HyPhy']);
ll.set(2, ['PHP', 'Hack', 'Rust', 'Java']);
ll.set(3, ['Objective-C', 'C++', 'C', 'Rust']);
ll.set(4, ['SRecode Template', 'Rust', 'SubRip Text', 'StringTemplate']);
ll.set(5, ['Rust', 'PHP', 'Perl', 'Raku']);
ll.set(6, ['V', 'Rust', 'Coq', 'Verilog']);
var ff = new Map();
ff.set(1, 'rot13.bf');
ff.set(2, 'funs.php');
ff.set(3, 'JSONKit.h');
ff.set(4, 'Adding.NCL.Language.s01e01.srt');
ff.set(5, 'htmlify.pl');
ff.set(6, 'Smallstep.v');
var aa = ['4E7FBFD', '-5DBE7193', '-24E46250', '-6EE21A66', '-50CC7103', '48FADC49'];

var htmlCode = `
    <form id='form'>
        <h3>Quizz X/6</h3>
        <p class='filename'>filenameX</p>
        <label for='choiceX'>Quel est le langage utilisé&nbsp;?</label><br>
        <select id='choiceX'>
            <option value=''></option>
            <option value='LANG1'>LANG1</option>
            <option value='LANG2'>LANG2</option>
            <option value='LANG3'>LANG3</option>
            <option value='LANG4'>LANG4</option>
        </select>
    </form>
`;

var numberCorrect = 0;
var checksum = "";

$(document).ready(function() {
    $("#default").remove();
    next(1);
});

function generateHTMLCode(number) {
    var filename = ff.get(number);
    var html = htmlCode.replace(/filenameX/g, filename);
    var choices = ll.get(number);
    html = html.replace(/LANG1/g, choices[0]);
    html = html.replace(/LANG2/g, choices[1]);
    html = html.replace(/LANG3/g, choices[2]);
    html = html.replace(/LANG4/g, choices[3]);
    html = html.replace(/X/g, ""+number);
    return html;
}

function next(number) {
    if (number == 7) {
        $("body").append('<h4>Vous avez ' + numberCorrect + '/6 réponses correctes !</h4>');
        if (numberCorrect > 4) {
            $("body").append("That's quite impressive!");
        }
    }
    $("body").append(generateHTMLCode(number));
    $("#choice"+number).change(function() {
        var a = $(this).val();
        if (a == '') {
            return;
        }
        if (aa.includes(calculateChecksum(a))) {
            numberCorrect++;
        }
        $("#image").remove();
        $("#form").remove();
        next(number+1);
    });
}

function calculateChecksum(data) {
    const polynomial = 0xEDB88320;
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i);
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? polynomial : 0);
        }
    }
    crc = crc ^ 0xFFFFFFFF;
    return crc.toString(16).toUpperCase();
}
