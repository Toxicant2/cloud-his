// 去除打印的头部和底部
export function remove_ie_header_and_footer() {
    var hkey_path
    hkey_path = 'HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\PageSetup\\'
    try {
        var RegWsh = new ActiveXObject('WScript.Shell')
        RegWsh.RegWrite(hkey_path + 'header', '')
        RegWsh.RegWrite(hkey_path + 'footer', '')
    } catch (e) {
        console.log(e)
    }
}
