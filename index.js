var WebSocket = require('ws'),
    superagent = require('superagent'),
    tskMD5 = require('./tsk_md5')
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'OHAI> '
});

var obj = {}, httpHeader = {}, baseUrl ='', pass = '', ip = '', websocketUrl = ''
var keepWsAlive, readyState
var trackid = randomWord(false, 32)
function randomWord(randomFlag, min, max, type){
    // randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
    // 固定位数随机数：randomWord(false, 15)
    // 3 到14位随机数：randomWord(true, 3, 14)
    var str = "",
        s_arr = [],
        range = min,
        arrHasUpper = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        arrOnlyNum = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // 随机产生
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    s_arr = arr
    
    for(var i=0; i<range; i++){
        var pos = Math.round(Math.random() * (s_arr.length-1));
        str += s_arr[pos];
    }
    return str;
}
// readline输入
function getReadline() {
    const lines = [];
    console.log('Please input the range of extensions(ex: 1001,1010):\n')
    rl.on("line", function(line) {
        if (line ==='') {
            console.log('The input is empty, please input again:\n')
        } else {
            lines.push(line);
            if (lines.length === 1) {
                obj.extensionsArr = line.split(',');
                console.log('Please input the password(ex:1234aa):\n')
            } else if (lines.length === 2) {
                obj.password = line;
                pass = line;
                console.log('Please input the ip(ex:192.168.124.125):\n')
            } else if (lines.length === 3) {
                websocketUrl = 'ws://' + line + ':8089/ws';
                obj.websocketUrl = websocketUrl;
                obj.ip = line;
                ip = line;
                console.log('Starting register...\n');
                // 开始注册事件
                loopRegister(obj)
            }
        }
    });
}

function loopRegister(obj) {
    var exRange = obj.extensionsArr, arr = []
    if(exRange.length === 2) {
        for (var i = parseInt(exRange[0]); i <= parseInt(exRange[1]); i++) {
           arr.push(i)
        }
    } else {
        arr = exRange
    }
    var extensionsArr = arr

    for(var i = 0; i< extensionsArr.length; i++){
        (function (i) {
			// 每间隔一秒再发一次注册，减轻服务器的注册压力
            setTimeout(function () {
                setHttpHeader(extensionsArr[i].toString())
            },i * 1000)
        })(i)
    }
}
// 设置httpHeader
function setHttpHeader(username) {
    console.log('---start setHttpHeader-- wenjwu----')
    httpHeader = {
        Accept:'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,pt;q=0.7',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Cookie: 'TRACKID='+trackid+'; session-identify=sid121076289-1520217430; username=admin; user_id=0',
        Host: ip +':8089',
        Origin: 'http://'+ip+':8089',
        Pragma: 'no-cache',
        Referer: 'http://'+ip+':8089/gswave/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 Safari/537.36 SE 2.X MetaSr 1.0',
        'X-Requested-With':'XMLHttpRequest'
    }
    var accountData = {
        action:'challenge',
        user:username
    }
    baseUrl = 'http://'+ip+':8089/webrtccgi?';
    getChanllenge(accountData, username)
}

//账户数据和模拟浏览器的Header
function getChanllenge(accountData, username) {
    console.log('start getChangllenge')
    var challenge = ''
//获取challenge
    superagent
        .post(baseUrl)
        .set(httpHeader)
        .type('form')
        .send(accountData)
        .redirects(0)
        .end(function(err, result) {
            if (typeof(result) == 'undefined') {
                console.error("get challenge is error, result is undefined");
            } else {
                var responce = result.body
                if(responce && responce.status === 0) {
                    challenge = responce.response.challenge
                    getCookie(challenge, username)
                } else {
                    console.error('get challenge is error, result.body.status is not 0')
                }
            }
        });
}
// 设置cookie
function getCookie(challenge, username) {
    console.log('start getcookie')
    var md5key = tskMD5.MD5.hexdigest(challenge + pass)
    var subData={
        token: md5key,
        action: 'login',
        user: username
    }
    superagent
        .post(baseUrl)
        .set(httpHeader)
        .type('form')
        .send(subData)
        .redirects(0)
        .end(function(err, res) {
            if (typeof(res) == 'undefined') {
                console.log("get cookie is error, result is undefined");
            } else {
                var responce = res.body
                if(responce && responce.status === 0) {
                    var cookie = responce.response.cookie
                    startSocket(username)
                } else {
                    console.log('get cookie is error, result.body.status is not 0')
                }
            }
        })
}

// 建立socket
var response, cnonceNum, nonceNum, opaqueNum;
function startSocket(username) {
    console.log('start startSocket')
    var message1 = "REGISTER sip:"+ip+" SIP/2.0\r\n" +
        "Via: SIP/2.0/WS df7jal23ls0d.invalid;branch=z9hG4bKxrQq2RqiQI22DvOSuDi38DV43vlWvvp5;rport\r\n" +
        "From: \""+username +"\"<sip:"+username+"@"+ip+">;tag=KGCA29uWfaTTDsLo499K\r\n" +
        "To: \""+username+"\"<sip:"+username+"@"+ip+">\r\n" +
        "Contact: \""+username+"\"<sip:"+username+"@df7jal23ls0d.invalid;rtcweb-breaker=no;transport=ws>;expires=180000;click2call=no;+sip.instance=\"<urn:uuid:07d3dd0124b68aca079be5e6b8eeca9f>\";+g.oma.sip-im;+audio;language=\"en,fr\"\r\n" +
        "Call-ID: 0e93228e-de2f-dc70-46ea-f551249e71f7\r\n" +
        "CSeq: 12 REGISTER\r\n" +
        "Content-Length:0\r\n" +
        "Max-Forwards: 70\r\n" +
        "User-Agent: Grandstream Wave/webrtc_chrome\r\n" +
        "Organization: Grandstream\r\n" +
        "Supported: path\r\n\r\n";

    var ws = new WebSocket(websocketUrl, "sip");
    // var ws = new WebSocket('ws://192.168.124.156:8089/ws', "sip");

    ws.on('open', function open() {
        console.log('ws open message1' + message1)
        readyState = WebSocket.OPEN
        ws.send(message1);
    });
    var a = 0
    ws.on('message', function incoming(data) {
        a++;
        console.log('----ws onmessage data---')
        console.log(data);
        var dataArr = data.split('\r\n')
        if (dataArr[0].indexOf('401') > -1 && a === 1) {
            startRegister(ws,dataArr, username)
        } else if (dataArr[0].indexOf('200')) {
            // ws.close()
            // console.log('register sucess...')
        } else {
        }
    });
    ws.on('close',function close (evt) {
        console.log("Connection closed.");
        console.log(evt)
        readyState = WebSocket.CLOSED
        if (keepWsAlive) {
            clearInterval(keepWsAlive)
        }
    })
    ws.on('error',function close (error) {
        console.log("ws has err.");
        console.log(error)
        readyState = WebSocket.CLOSED
        if (keepWsAlive) {
            clearInterval(keepWsAlive)
        }
    })
}
function sliceStr(str) {
    var index1 = str.indexOf("\""),
        index2 = str.lastIndexOf("\""),
        result = str.slice(index1+1, index2);
    return result
}
// 启动协议栈
// todo nodeJS register event
function startRegister(ws, dataArr, username) {

    var username = username,realm = 'grandstream'
    if (dataArr[3] !== '') {
        username = sliceStr(dataArr[3])
    }
    var revS = dataArr[6].split(',')
    if (revS[0] !== '') {
        realm = sliceStr(revS[0])
    }
    var authen = revS[0]
    var nonce = revS[1]
    nonceNum = nonce.slice(7,-1)
    var opaque = revS[2]
    opaqueNum = opaque.slice(8,-1)
    var algorithm = revS[3]
    var qop = revS[4]
    var qopNum = qop.slice(5,-1)
    var uri = 'sip:' + ip
    var s_ha1 = tskMD5.MD5.hexdigest(username + ":"+ realm + ":"+ pass)
    var s_ha2 = tskMD5.MD5.hexdigest('REGISTER' + ":" + uri)
    var nc = '00000001'
    cnonceNum = tskMD5.MD5.hexdigest('0d39fd298b8149ed1c1f72cd802a9a3c')
    response = tskMD5.MD5.hexdigest(s_ha1+":"+ nonceNum +":"+ nc +":"+ cnonceNum +":"+ qopNum +":"+ s_ha2)
    var message2 = "REGISTER sip:"+ip+" SIP/2.0\r\n" +
        "Via: SIP/2.0/WS df7jal23ls0d.invalid;branch=z9hG4bKfSgRMgXHpTTfBVF1nm7qsQSZRWNNKTcl;rport\r\n" +
        "From: \""+username +"\"<sip:"+username+"@"+ip+">;tag=KGCA29uWfaTTDsLo499K\r\n" +
        "To: \""+username+"\"<sip:"+username+"@"+ip+">\r\n" +
        "Contact: \""+username+"\"<sip:"+username+"@df7jal23ls0d.invalid;rtcweb-breaker=no;transport=ws>;expires=180000;click2call=no;+sip.instance=\"<urn:uuid:07d3dd0129b68aca079be5e6b8eeca9f>\";+g.oma.sip-im;+audio;language=\"en,fr\"\r\n" +
        "Call-ID: 0e9b128e-de2f-dc70-46ea-f551219e71f7\r\n" +
        "CSeq: 13 REGISTER\r\n" +
        "Content-Length:0\r\n" +
        "Max-Forwards: 70\r\n" +
        "Authorization: Digest username=\""+username+"\",realm=\""+realm+"\",nonce=\""+nonceNum+"\",uri=\""+uri+"\",response=\""+response+"\",algorithm=md5,cnonce=\""+cnonceNum+"\",opaque=\""+opaqueNum+"\",qop="+qopNum+",nc="+nc+"\r\n" +
        "User-Agent: Grandstream Wave/webrtc_chrome\r\n" +
        "Organization: Grandstream\r\n" +
        "Supported: path\r\n\r\n";
        ws.send(message2);
        var msg = "\r\n"
        keepWsAlive = setInterval(()=> {
            if (ws && readyState === WebSocket.OPEN) {
                console.log('keepWsAlive to send \r\n ')
                ws.send(msg);
            }
        }, 6000)
}

getReadline()
