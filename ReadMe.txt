1. 依赖环境：nodeJs
    
	根据本机型号，安装配置Node.js,安装步骤地址参考下面。
    	
	http://www.runoob.com/nodejs/nodejs-install-setup.html



2. 项目执行要求
    
	a. 将UCMHttp协议类型修改为http;
   
	b. 批量新建SIP密码相同的webRTC分机

	c. 手动修改配置文件，增加超时时间设置

        /cfg/etc/lighttpd
        vi lighttpd.conf
        增加： server.max-write-idle = 60000
		重启lighttpd: 
		 killall -9 lighttpd
		 /app/asterisk/sbin/lighttpd -f /app/asterisk/etc/lighttpd/lighttpd.conf




3. 执行步骤
    
	a. 在项目根目录（与package.json同目录级别）执行 "npm install”,安装项目依赖包
    
	b. 依赖包安装完全后，在项目根目录执行命令“ node index.js”
    
	c. 输入批量注册的分机号范围，格式：开始分机号，结束分机号，例如：1000，1010，
模拟注册的分机号即从1000开始，一直到1010，中间分机号自动填充注册。
    
	d. 输入批量分机的相同注册密码，例如：“1234aa”
    
	e. 输入服务器IP地址，无需端口号，默认8089端口，例如：“192.168.129.155”
    
	f. 回车后直接进入模拟注册过程。



4. 备注
    
	a.建议先模拟注册一个分机，若返回404，500等系列问题，需要排查下UCM本身问题。

    
	b.如果执行后没有出现服务中断，且SIP信令返回200 Ok，注册成功，可以在UCM分机页面观看注册结果。
    
	c.当模拟数过多（UCM65系列100路）会出现websocket连接失败，导致后续分机注册失败，该问题还需
后台开发排除是否限制连接数的原因
    
	d.注册成功以UCM分机页面结果或者后台查询结果为主。
    
	e.因为本脚本只有注册事件，没有注销事件，所以只可以通过执行'Ctrl+ C'中断node服务,或者在服务端
中断连接实现分机注销功能。




