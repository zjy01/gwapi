/**
 * Created by zjy on 15-9-26.
 */;
var gw=require("../../gwapi");
var g=new gw();
var $user={
    "username":"your ѧ��",
    "password":"your ����"
};
g.login($user, function(err,res){
    if(err){
        return ;
    }
    //��ȡ�û���Ϣ
    var $data1={
        "req":"getUser"
    };
    res.do($data1,function (info) {
        console.log(info);
    });
    //��ȡ�α�
    var $data2={
        "req":"getCourse"
    };
    res.do($data2,function (info) {
        console.log(info);
    });
    //��ȡ�ɼ�
    var $msg={
        xn:"2013-2014",//ѧ��
        xq:"1",//ѧ��
        get:"2"//1��ʾ��ѧ�ڻ�ȡ��2��ʾ��ѧ���ȡ
    };
    var $data3={
        "req":"getGrade",
        "data":$msg
    };
    res.do($data3,function (info) {
        console.log(info);
    });
});