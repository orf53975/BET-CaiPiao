angular.module('cpApp').controller('fclhcF3dCtrl', ['$rootScope', '$scope', 'gameService', '$stateParams', '$interval', '$timeout', 'localStorage', 'UI', 'CPMisc',
  function($rootScope, $scope, gameService, $stateParams, $interval, $timeout, localStorage, UI, CPMisc) {
	
    //获取头部信息
    console.log($stateParams);
    if ($stateParams.name) {
        localStorage.setItem('fclhcName', $stateParams.name);
    }
    getTopData();

    function getTopData() {
        gameService.getData('/game/recent-issues', {
            params: {
                gameCode: localStorage.getItem('fclhcName')
            },
            timeout: 30000
        }).then(function(res) {
            console.log(res);
            if (!res.data.rs) {
                return;
            }
            $rootScope.title = res.data.datas.gameCnName || '一般彩票';
            $scope.lotKind = res.data.datas.gameCnName;
            $scope.lotEnName = res.data.datas.gameEnName;
            $scope.lastNumber = res.data.datas.lastNumber;
            $scope.lastResults = res.data.datas.lotteryBalls.split(',');
            $scope.currentNumber = res.data.datas.currentNumber;
            //获取倒计时时间
            $scope.downTimeLeft = {second: Number(res.data.datas.downTimeLeft)};
            $scope.betAdvanceTime = Number(res.data.datas.betAdvanceTime);
            $scope.closeTimeLeft =  {second: $scope.downTimeLeft['second'] + $scope.betAdvanceTime};
            
        }, function(error) {});
    }
    
    //开奖数据与分页
    $scope.pageLimit = 25; //每页默认显示条数
    $scope.currentPage = 1; //默认查询第一页
    $scope.pageIndex = 1; //默认最左边为1
    $scope.numberLimit = 3; //索引只显示1，2，3；若要1，2，3，4值值为4
    function getOpenData() {
        var resultsPromise = gameService.getData('/lotteryCenter/getAllGameTypeNewResultList', {
            params: {
                code: localStorage.getItem('fclhcName'),
                currentPage: $scope.currentPage,
                pageLimit: $scope.pageLimit
            },
            timeout: 30000
        });
        resultsPromise.then(function(res) {
            console.log(res);
            if (!res.data.rs) {
                return;
            }
            $scope.gameResults = res.data.datas.result;
            //分页
            $scope.totalCount = res.data.datas.totalCount;
            $scope.totalPages = Math.ceil($scope.totalCount / $scope.pageLimit);
        }, function(error) {
            console.log(error);
        });
    }
    getOpenData();
    //分页
    $scope.secPage = function(arg) {
        $scope.currentPage = arg;
    };
    $scope.firstPage = function() {
        $scope.currentPage = 1;
        $scope.pageIndex = 1;
    };
    $scope.lastPage = function() {
        $scope.currentPage = $scope.totalPages;
        $scope.pageIndex = $scope.totalPages - ($scope.numberLimit - 1);
    };
    $scope.nextPage = function() {
        if ($scope.currentPage == $scope.totalPages) {
            return;
        }
        if ($scope.currentPage == $scope.pageIndex + ($scope.numberLimit - 1)) {
            $scope.pageIndex++;
        }
        $scope.currentPage++;
    };
    $scope.prevPage = function() {
        if ($scope.currentPage == 1) {
            return;
        }
        if ($scope.currentPage == $scope.pageIndex) {
            $scope.pageIndex--;
        }
        $scope.currentPage--;
    };
    $scope.$watch('currentPage', function(newVal, oldVal) {
        if (newVal) {
            gameService.getData('/lotteryCenter/getAllGameTypeNewResultList', {
                params: {
                    code: localStorage.getItem('fclhcName'),
                    currentPage: newVal,
                    pageLimit: $scope.pageLimit
                },
                timeout: 30000
            }).then(function(res) {
                if (!res.data.rs) {
                    return;
                }
                $scope.gameResults = res.data.datas.result;
            }, function(error) {
                console.log(error);
            });
        }
    });
    //玩法tab切换
    if($stateParams.name=='FC3D'||$stateParams.name=='PL3'){
      localStorage.setItem('curPlay',"ZPS");//默认主盘式
    }else{
      localStorage.setItem('curPlay',"TM");//香港六合彩默认特码
    }
    $scope.curPlay = localStorage.getItem('curPlay'); 
    $scope.yzLists = {};
    $scope.yzLists.yzList = "yzzh"; //默认显示一字组合;
    $scope.ezLists = {};
    $scope.ezLists.ezList = "ezzh"; //默认显示二字组合;
    $scope.swTabs = {};
    $scope.swTabs.swTab = 'qsw'; //默认显示前三位;
    //赔率
    function getPL(code, code2) {
        gameService.getData('/game/server', {
            params: {
                code: code,
                code2: code2,
            },
            timeout: 30000
        }).then(function(res) {
                if (!res.data.rs) {
                    return;
                }
                // console.log(res);
                $scope.pls = res.data.datas;
                $scope.cols = 5; //自定义列数
                //fc3d&pl3
                if ($scope.curPlay == "ZPS") {
                    var zps_pls = ['WDW', 'QDW', 'BDW', 'SDW', 'GDW'];
                    var zps_filter = function(text) {
                        return function(item, index) {
                            return item.id.split('-')[1] == text;
                        };
                    };
                    zps_pls.map(function(value, key) {
                        $scope[value.toLowerCase() + 'Pls'] = $scope.pls.filter(zps_filter(value));
                    });
                }
                if ($scope.curPlay == "YZ") {
                    $scope.qwyzzhPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('_')[0] == 'YZ-YZZH-QW';
                    });
                    $scope.qsyzzhPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('_')[0] == 'YZ-YZZH-QSW';
                    });
                    $scope.zsyzzhPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('_')[0] == 'YZ-YZZH-ZSW';
                    });
                    $scope.hsyzzhPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('_')[0] == 'YZ-YZZH-HSW';
                    });
                    $scope.yzzhPls = {
                        '全五一字组合': $scope.qwyzzhPls,
                    };
                    $scope.wdwPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('-')[1] == 'WDW';
                    });
                    $scope.wdwNumPls = $scope.wdwPls.filter(function(item, index) {
                        var num = item.id.split('-')[2];
                        return !isNaN(Number(num));
                    });
                    $scope.qdwPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('-')[1] == 'QDW';
                    });
                    $scope.qdwNumPls = $scope.qdwPls.filter(function(item, index) {
                        var num = item.id.split('-')[2];
                        return !isNaN(Number(num));
                    });
                    $scope.bdwPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('-')[1] == 'BDW';
                    });
                    $scope.bdwNumPls = $scope.bdwPls.filter(function(item, index) {
                        var num = item.id.split('-')[2];
                        return !isNaN(Number(num));
                    });
                    $scope.bdwPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('-')[1] == 'BDW';
                    });
                    $scope.bdwNumPls = $scope.bdwPls.filter(function(item, index) {
                        var num = item.id.split('-')[2];
                        return !isNaN(Number(num));
                    });
                    $scope.sdwPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('-')[1] == 'SDW';
                    });
                    $scope.sdwNumPls = $scope.sdwPls.filter(function(item, index) {
                        var num = item.id.split('-')[2];
                        return !isNaN(Number(num));
                    });
                    $scope.gdwPls = $scope.pls.filter(function(item, index) {
                        return item.id.split('-')[1] == 'GDW';
                    });
                    $scope.gdwNumPls = $scope.gdwPls.filter(function(item, index) {
                        var num = item.id.split('-')[2];
                        return !isNaN(Number(num));
                    });
                }
                if ($scope.curPlay == 'EZ') {
                    $scope.ez_kinds = ['ezzh', 'bsdw', 'bgdw', 'sgdw', 'bghs', 'sghs'];
                    //写这个函数方便传参
                    var filter_ezFun = function(text) {
                        return function(item, index) {
                            return item.id.split('-')[1] == text.toUpperCase();
                        };
                    };
                    //分割传过来的数据数组方便渲染
                    $scope.ez_kinds.map(function(value, key) {
                        $scope[value] = $scope.pls.filter(filter_ezFun(value));
                    });
                    //行数控制
                    $scope.ez_kinds.map(function(value, key) {
                        $scope[value + '_lines'] = Math.ceil($scope[value].length / $scope.cols);
                    });
                }
                if ($scope.curPlay == 'SZ') {
                    $scope.szLists = {};
                    $scope.szLists.szList = 'szzh'; //默认显示三字组合
                    $scope.sz_kinds = ['szzh', 'bsgdw', 'bsghs'];
                    //写这个函数方便传参
                    var filter_szFun = function(text) {
                        return function(item, index) {
                            return item.id.split('-')[1] == text.toUpperCase();
                        };
                    };
                    //分割传过来的数据数组方便渲染
                    $scope.sz_kinds.map(function(value, key) {
                        $scope[value] = $scope.pls.filter(filter_szFun(value));
                    });
                    //行数控制
                    $scope.sz_kinds.map(function(value, key) {
                        $scope[value + '_lines'] = Math.ceil($scope[value].length / $scope.cols);
                    });
                }
                if ($scope.curPlay == 'YZGG') {
                    $scope.yzzh_qsw = $scope.pls.filter(function(value, index) {
                        return value.id.split('-')[1] == 'QSW';
                    });
                    $scope.yzzh_zsw = $scope.pls.filter(function(value, index) {
                        return value.id.split('-')[1] == 'ZSW';
                    });
                    $scope.yzzh_hsw = $scope.pls.filter(function(value, index) {
                        return value.id.split('-')[1] == 'HSW';
                    });
                    $scope.yzzh_qsw_lines = Math.ceil($scope.yzzh_qsw.length / 3);
                    $scope.yzzh_zsw_lines = Math.ceil($scope.yzzh_zsw.length / 3);
                    $scope.yzzh_hsw_lines = Math.ceil($scope.yzzh_hsw.length / 3);
                }
                if ($scope.curPlay == 'KD') {
                    $scope.kd_kinds = ['kd'];
                    $scope.kd_kinds.map(function(item, index) {
                        $scope[item] = $scope.pls.filter(filter_kd(item));
                    });

                    var filter_kd = function(text) {
                        return function(value, key) {
                            return value.id.split('-')[1] == text.toUpperCase();
                        };
                    };
                    $scope.kd_kinds.map(function(item, index) {
                        $scope[item + '_lines'] = Math.ceil($scope[item].length / $scope.cols);
                    });
                }
                if ($scope.curPlay == 'QT') {
                    $scope.qt_kinds = ['qt_qt','qt_zd','qt_bch'];

                    var filter_qt = function(text) {
                        return function(value, key) {
                            return value.id.split('-')[1] == text.toUpperCase().split('_')[1];
                        };
                    };
                    $scope.qt_kinds.map(function(item, index) {
                        $scope[item] = $scope.pls.filter(filter_qt(item));
                    });
                }
                //六合彩部分
                if($scope.curPlay=='TM'){
                  $scope.tmTab = 'tmA';//默认显示特码A
                  $scope.tm_a_pls = $scope.pls.filter(function(value,key){
                    return value.id.split('-')[1] == 'TM_A';
                  });
                  $scope.tm_b_pls = $scope.pls.filter(function(value,key){
                    return value.id.split('-')[1] == 'TM_B';
                  });
                  //判断序号是否要红圈
                  $scope.ifBgCircle = function(arg){
                    return !isNaN(Number(arg));
                  };
                }
                if($scope.curPlay=='ZMT'){
                  $scope.zmtTab = 'z1t';//默认正1特
                  $scope.zmtKinds = ['z1t','z2t','z3t','z4t','z5t','z6t'];
                  var zmt_filter = function(text){
                    return function(item,index){
                      return item.id.split('-')[1] == text.toUpperCase();
                    };
                  };
                  $scope.zmtKinds.forEach( function(kind, index) {
                    $scope[kind + '_pls'] = $scope.pls.filter(zmt_filter(kind));
                  });
                }
                if($scope.curPlay=='ZM'){
                  $scope.zmTab = 'zmA';//默认显示特码A
                  $scope.zm_a_pls = $scope.pls.filter(function(value,key){
                    return value.id.split('-')[1] == 'ZM_A';
                  });
                  $scope.zm_b_pls = $scope.pls.filter(function(value,key){
                    return value.id.split('-')[1] == 'ZM_B';
                  });
                  //判断序号是否要红圈
                  $scope.ifBgCircle = function(arg){
                    return !isNaN(Number(arg));
                  };
                }
                if($scope.curPlay=='ZM1T6'){
                  $scope.zmtTab = 'zm1';//默认正1特
                  $scope.zmtKinds = ['zm1','zm2','zm3','zm4','zm5','zm6'];
                  var zm1t6_filter = function(text){
                    return function(item,index){
                      return item.id.split('-')[1] == text.toUpperCase();
                    };
                  };
                  $scope.zmtKinds.forEach( function(kind, index) {
                    $scope[kind + '_pls'] = $scope.pls.filter(zm1t6_filter(kind));
                  });
                }
                if($scope.curPlay=='GG'){
                  $scope.zmtTab = 'zm1';//默认正1特
                  $scope.zmtKinds = ['zm1','zm2','zm3','zm4','zm5','zm6'];
                  var zm1t6_filters = function(text){
                    return function(item,index){
                      return item.id.split('-')[1] == text.toUpperCase();
                    };
                  };
                  $scope.zmtKinds.forEach( function(kind, index) {
                    $scope[kind + '_pls'] = $scope.pls.filter(zm1t6_filters(kind));
                  });
                }
                if($scope.curPlay=='LM'){
                  var lm_kinds = ['3qz','z2','z3','2qz','zt','tz2','tc'];
                  lm_kinds.forEach(function(kind,index){
                    $scope['t'+kind+'_pl'] = $scope.pls.filter(lm_filter(kind))[0].pl;
                  });
                  // console.log($scope['t3qz_pl']);
                  var lm_filter = function(text){
                    return function(value,key){
                      return value.id.split('-')[2] == text.toUpperCase();
                    };
                  };
                }
                if($scope.curPlay == 'BB'){
                  $scope.bbTab = 'bb';//默认半波
                  var bbKinds = ['BB-BB-RED_ODD','BB-BB-RED_EVEN','BB-BB-RED_BIG','BB-BB-RED_SMALL','BB-BB-GREEN_ODD','BB-BB-GREEN_EVEN','BB-BB-GREEN_SMALL','BB-BB-GREEN_BIG','BB-BB-BLUE_ODD','BB-BB-BLUE_EVEN','BB-BB-BLUE_SMALL','BB-BB-BLUE_BIG','BB-BBB-RED_BIG_ODD','BB-BBB-RED_BIG_EVEN','BB-BBB-RED_SMALL_ODD','BB-BBB-RED_SMALL_EVEN','BB-BBB-GREEN_BIG_ODD','BB-BBB-GREEN_BIG_EVEN','BB-BBB-GREEN_SMALL_ODD','BB-BBB-GREEN_SMALL_EVEN','BB-BBB-BLUE_BIG_ODD','BB-BBB-BLUE_BIG_EVEN','BB-BBB-BLUE_SMALL_ODD','BB-BBB-BLUE_SMALL_EVEN'];
                  bbKinds.forEach(function(kind,index){
                    $scope[kind.split('-').join('')] = $scope.pls.filter(bb_filter(kind))[0];
                  });
                  var bb_filter = function(kind){
                    return function (item,index) {
                      return item.id == kind;
                    };
                  };
                }
                if($scope.curPlay == 'YXYZTW'){
                  $scope.yxztwTab = 'ztw';//默认显示正特尾
                  var yxztw_kinds = ['ztwxz','yxxz'];
                  yxztw_kinds.forEach(function(kind,index){
                    $scope[kind+'_pls'] = $scope.pls.filter(yxztw_filter(kind));
                  });
                  var yxztw_filter = function(kind){
                    return function (item,index) {
                      return item.id.split('-')[1]==kind.toUpperCase();
                    };
                  };
                  var yxxz_kinds = ['shu','niu','hu','tu','long','she','ma','yang','hou','ji','gou','zhu'];
                  yxxz_kinds.forEach(function(kind,index){
                    $scope[kind+'_pls'] = $scope['yxxz_pls'].filter(yxxz_filter(kind))[0];
                  }); 
                  var yxxz_filter = function(kind) {
                    return function(item,index){
                      return item.id.split('-')[2] == kind.toUpperCase();
                    };
                  };
                }
                if($scope.curPlay == 'TXTW'){
                  var txtw_kinds = ['tmsx','ttw'];
                  txtw_kinds.forEach(function(kind,index){
                    $scope[kind+'_pls'] = $scope.pls.filter(txtw_filter(kind));
                  });
                  var txtw_filter = function(kind){
                    return function(item,index){
                      return item.id.split('-')[1] == kind.toUpperCase();
                    };
                  };
                  //生肖
                  var tmsx_kinds = ['shu','niu','hu','tu','long','she','ma','yang','hou','ji','gou','zhu'];
                  tmsx_kinds.forEach(function(kind,index){
                    $scope[kind+'_pls'] = $scope['tmsx_pls'].filter(tmsx_filter(kind))[0];
                  }); 
                  var tmsx_filter = function(kind) {
                    return function(item,index){
                      return item.id.split('-')[2] == kind.toUpperCase();
                    };
                  };
                }
                if($scope.curPlay == 'ZYBZ'){
                  $scope.zybzTab = 'wbz';//
                  var zybz_kinds = ['wbz','qbz','jbz','szy','lzy'];
                  zybz_kinds.forEach(function(kind,index){
                    $scope[kind+'_pls'] = $scope.pls.filter(zybz_filter(kind));
                  });
                  var zybz_filter = function(kind){
                    return function(item,index){
                      return item.id.split('-')[1] == kind.toUpperCase();
                    };
                  };
                }
                if($scope.curPlay == 'WSL'){
                  $scope.wslTab = 'ewl';//默认显示二尾连
                  var wslKinds = ['ewl','sawl','siwl'];
                  wslKinds.forEach(function(kind,index){
                    $scope[kind+'_pls'] = $scope.pls.filter(wsl_filter(kind));
                  });
                  var wsl_filter = function(kind){
                    return function(item,index){
                      return item.id.split('-')[1] == kind.toUpperCase();
                    };
                  };
                }
                if($scope.curPlay == 'LX'){
                  $scope.lxTab = 'elx';//默认显示二连肖
                  var lxKinds = ['elx','salx','silx','wlx'];
                  lxKinds.forEach(function(kind,index){
                    $scope[kind+'_pls'] = $scope.pls.filter(lx_filter(kind));
                  });
                  var lx_filter = function(kind){
                    return function(item,index){
                      return item.id.split('-')[1] == kind.toUpperCase();
                    };
                  };
                  //生肖
                  var sx_kinds = ['shu','niu','hu','tu','long','she','ma','yang','hou','ji','gou','zhu'];
                  sx_kinds.forEach(function(kind,index){
                    $scope[kind+'_elx_pls'] = $scope['elx_pls'].filter(sx_filters(kind))[0];
                  }); 
                  sx_kinds.forEach(function(kind,index){
                    $scope[kind+'_salx_pls'] = $scope['salx_pls'].filter(sx_filters(kind))[0];
                  });
                  sx_kinds.forEach(function(kind,index){
                    $scope[kind+'_silx_pls'] = $scope['silx_pls'].filter(sx_filters(kind))[0];
                  });
                  sx_kinds.forEach(function(kind,index){
                    $scope[kind+'_wlx_pls'] = $scope['wlx_pls'].filter(sx_filters(kind))[0];
                  });
                  var sx_filters =function(kind) {
                    return function(item,index){
                      return item.id.split('-')[2] == kind.toUpperCase();
                    };
                  };
                }
                if($scope.curPlay == 'HX'){
                  $scope.hxTab = 'ex';//默认显示二连肖
                  var hxKinds = ['ex','sx','lx'];
                  hxKinds.forEach(function(kind,index){
                    $scope[kind+'_pls'] = $scope.pls.filter(hx_filter(kind));
                  });
                  var hx_filter = function(kind){
                    return function(item,index){
                      return item.id.split('-')[1] == kind.toUpperCase();
                    };
                  };
                  //生肖
                  var sx_Kinds = ['shu','niu','hu','tu','long','she','ma','yang','hou','ji','gou','zhu'];
                  sx_Kinds.forEach(function(kind,index){
                    $scope[kind+'_ex_pls'] = $scope['ex_pls'].filter(sx_filter(kind))[0];
                  }); 
                  sx_Kinds.forEach(function(kind,index){
                    $scope[kind+'_sx_pls'] = $scope['sx_pls'].filter(sx_filter(kind))[0];
                  });
                  sx_Kinds.forEach(function(kind,index){
                    $scope[kind+'_lx_pls'] = $scope['lx_pls'].filter(sx_filter(kind))[0];
                  });
                  var sx_filter = function(kind) {
                    return function(item,index){
                      return item.id.split('-')[2] == kind.toUpperCase();
                    };
                  };
                }
            },
            function(error) {
                console.log(error);
            });
    }
    getPL(localStorage.getItem('fclhcName'), $scope.curPlay);
    //监听玩法获取不同玩法的赔率
    $scope.$watch('curPlay', function(newVal, oldVal) {
        if (newVal) {
            getPL(localStorage.getItem('fclhcName'), newVal);
        }
    });
    
    $scope.data = {
    	betMoney: {},
    	betPeiyuSelected: {}, // 选中的赔率
    	betYzggPeiyuSelected: {}, // 一字过关选中的赔率
    	betZxsPeiyuSelected: {},
    	betCode: {}, // 符合接口数据结构的服务器数据
    	betSelectedCode: {}, // 选中的码
    	quickOrderMoney: '',
    	inputErrors: {}, // 输入金额不足错误提示,
    	minBetMoney: 10, // 最小投注金额 - 暂时写死
    };
    
    $scope.fun = {
    	getPankouLabel: function (id) {
    		console.log(['id', id]);
    		var labels = {
    			'YZZH': '一字组合',
    			'GDW': '个定位',
    			'BDW': '百定位',
    			'SDW': '十定位',
    			'EZZH': '二字组合',
    			'BSDW': '百拾定位',
    			'BGDW': '百个定位',
    			'SGDW': '拾个定位',
    			'BGHS': '百个和数',
    			'SGHS': '拾个和数',
    			'BSGDW': '百拾个定位',
    			'SZZH': '三字组合',
    			'BSGHS': '百拾个和数',
    			'QT': '其他',
    			'ZD': '准对',
    			'BCH': '不出号',
    		};
    		if (id.indexOf('ZPS-')=== 0) {
    			var label = id.match(/ZPS\-(\w+)\-/)[1];
    			if (label) {
    				return labels[label];
    			}
    		}
    		if (id.indexOf('YZ-')=== 0) {
    			var label = id.match(/YZ\-(\w+)\-/)[1];
    			if (label) {
    				return labels[label];
    			}
    		}
    		if (id.indexOf('EZ-')=== 0) {
    			var label = id.match(/EZ\-(\w+)\-/)[1];
    			if (label) {
    				return labels[label];
    			}
    		}
    		if (id.indexOf('SZ-')=== 0) {
    			var label = id.match(/SZ\-(\w+)\-/)[1];
    			if (label) {
    				return labels[label];
    			}
    		}
    		if (id.indexOf('KD-')=== 0) {
    			return '跨度';
    		}
    		if (id.indexOf('QT-')=== 0 ) {
    			var label = id.match(/QT\-(\w+)\-/)[1];
    			if (label) {
    				return labels[label];
    			}
    			
    		}
    		return '';
    	},
    	codeSelected: function(obj) {
    		var money = $scope.data.betMoney[obj.id];
        	if (money < $scope.data.minBetMoney ) {
        		$scope.data.inputErrors[obj.id] = true;
        	}
        	else {
            	$scope.data.betCode[obj.id] = {
            		uid: obj.id,
            		rate: obj.pl,
            		xzje: money,
            		number: obj.number
                };
            	delete $scope.data.inputErrors[obj.id];
        	}
    	},
    	quickOrderMoneyChanged: function (quickMoney) {
    		if ($scope.curPlay.toLowerCase() == 'gg') {
    			for(var id in $scope.data.betCode) {
    				$scope.data.betCode[id]['xzje'] = $scope.data.quickOrderMoney;
    			}
    		}
    		else {
        		for (var id in $scope.data.betPeiyuSelected) {
    				$scope.data.betMoney[id] = quickMoney;
            		$scope.fun.codeSelected($scope.data.betPeiyuSelected[id]);
        		}
    		}
    	},
    	peiyuSelected: function (obj) {
    		var id = obj.id;
    		if (typeof $scope.data.betPeiyuSelected[id] == 'undefined') {
    			$scope.data.betPeiyuSelected[id] = obj;
    		}
    		else {
    			delete $scope.data.betPeiyuSelected[id];
    			$scope.fun.codeUnselected(id);
    		}

    		$scope.fun.quickOrderMoneyChanged($scope.data.quickOrderMoney);
    	},
    	codeUnselected: function (id) {
    		delete $scope.data.betCode[id];
    		delete $scope.data.betMoney[id];
    	},
        cancelOrder: function () {
        	$scope.data.betCode = {};
        	$scope.data.betMoney = {};
        	$scope.data.betSelected = {};
        	$scope.data.betQuickOrderMoney = '';
        	$scope.data.betPeiyuSelected = {};
        	$scope.data.inputErrors = {};
        	$scope.data.quickOrderMoney = '';
        },
        yzggSubmitOrder: function () {
        	
        	if (Object.keys($scope.data.betYzggPeiyuSelected).length < 2) {
        		UI.alert('至少需要选择两组号码！');
        		return ;
        	}
        	if ($scope.data.quickOrderMoney < $scope.data.minBetMoney) {
        		UI.alert('下注金额最少为'+$scope.data.minBetMoney + '元');
    			return ;
        	}
        	
        	CPMisc.getYzggOrders(
        			$scope.data.betYzggPeiyuSelected['bwNum'], 
        			$scope.data.betYzggPeiyuSelected['swNum'], 
        			$scope.data.betYzggPeiyuSelected['gwNum'],
        			$stateParams.name.toUpperCase(), 
        			$scope.curPlay.toUpperCase(), 
        			'QSW',
        			88).then(function (res) {
        		var orders = [];
    			var summary = {
    				total: 0,
    				totalMoney: 0,
    			};
    			res['orderList'].forEach(function(order) {
    				orders.push({
    					number: order['cateName']+ ':' +order['number'],
    					pl: order['rate'],
    					xzje: $scope.data.quickOrderMoney,
    				});
    				summary['total'] += 1;
    				summary['totalMoney'] += $scope.data.quickOrderMoney*1;
    			});
    			
    			UI.openBetConfirmDialog(summary, orders, function () {
        			CPMisc.saveOrder($stateParams.name, CPMisc.YZGG_FLAG, [{
        				typeCode: $scope.curPlay.toUpperCase(),
        				cateCode: 'QSW',
        				token: res['token'],
        				xzje: $scope.data.quickOrderMoney
        			}]).then(function (res) {
        				if (typeof res['data'] == 'string') {
            				UI.alert(res['data']['msg']);
            			}
            			else {
            				UI.alert(res['data']['msg']);
            			}
            			// 重置
            			$scope.fun.cancelOrder();
        			});
        		});
        	});
        },
        zxSubmitOrder: function () {
        	var nums = [];
        	for (var key in $scope.data.betMoney) {
        		if ($scope.data.betMoney[key]) {
        			nums.push(key.match(/\d+/));
        		}
        	}
        	var multilenConfig = {
        		zxs: {
        			limit: 5,
        			multilen: 3
        		},
        		zxl: {
        			limit: 4,
        			multilen: 6
        		}
        	};
        	if (nums.length < multilenConfig[$scope.curPlay.toLowerCase()]['limit']) {
        		UI.alert('选择的号码最小为'+multilenConfig[$scope.curPlay.toLowerCase()]['limit']+'个！');
        		return ;
        	}
        	if ($scope.data.quickOrderMoney < $scope.data.minBetMoney) {
        		UI.alert('下注金额最少为'+$scope.data.minBetMoney + '元');
        		return ;
        	}
        	//nums, gameCode, typeCode, cateCode, multilen
        	CPMisc.getZxOrders(nums.join(','), 
        			$stateParams.name.toUpperCase(), 
        			$scope.curPlay.toUpperCase() ,
        			'QSW', 
        			multilenConfig[$scope.curPlay.toLowerCase()]['multilen']).then(function (res) {
        				var orders = [];
            			var summary = {
            				total: 0,
            				totalMoney: 0,
            			};
            			res['orderList'].forEach(function(order) {
            				orders.push({
            					number: order['cateName']+ ':' +order['number'],
            					pl: order['rate'],
            					xzje: $scope.data.quickOrderMoney,
            				});
            				summary['total'] += 1;
            				summary['totalMoney'] += $scope.data.quickOrderMoney*1;
            			});
            			
            			UI.openBetConfirmDialog(summary, orders, function () {
                			CPMisc.saveOrder($stateParams.name, CPMisc.GROUP_FLAG, [{
                				cateCode: 'QSW',
                				typeCode: $scope.curPlay.toUpperCase(),
                				token: res['token'],
                				xzje: $scope.data.quickOrderMoney
                			}]).then(function (res) {
                				if (typeof res['data'] == 'string') {
                    				UI.alert(res['data']['msg']);
                    			}
                    			else {
                    				UI.alert(res['data']['msg']);
                    			}
                    			// 重置
                    			$scope.fun.cancelOrder();
                			});
                		});
        			});
        },
        fsSubmitOrder: function () {
        	// 先检查每一组
        	var	totalSelected = 0,
        		nums = {};
        	var groupNames = ['bwNum', 'swNum', 'gwNum'];
        	for (var index in groupNames) {
        		var group = groupNames[index];
        		nums[group] = [];
        		$scope.data.betMoney[group] = $scope.data.betMoney[group] || [];
        		console.log(['group', group,  $scope.data.betMoney[group]]);
        		if (Object.keys($scope.data.betMoney[group]).length <= 0) {
        			console.log(['group', group]);
        			if (group == 'bwNum') {
        				UI.alert('百位未选择号码，复式组合下注每位数最少选一个号码');
        				return ;
        			}
        			if (group == 'swNum') {
        				UI.alert('十位未选择号码，复式组合下注每位数最少选一个号码');
        				return ;
        			}
        			if (group == 'gwNum') {
        				UI.alert('个位未选择号码，复式组合下注每位数最少选一个号码');
        				return ;
        			}
        		}
        		for (var key in $scope.data.betMoney[group]) {
        			if ($scope.data.betMoney[group][key]) {
        				totalSelected += 1;
        				nums[group].push(key);
        			}
        		}
        	}
        	if (totalSelected < 9) {
        		UI.alert('三个位数选取号码不得少於9个，请继续选择');
        		return ;
        	}
        	if ($scope.data.quickOrderMoney < $scope.data.minBetMoney) {
        		UI.alert('下注金额最少为'+$scope.data.minBetMoney + '元');
        		return ;
        	}
        	
        	CPMisc.getYzggOrders(nums['bwNum'].join(','), nums['swNum'].join(','), nums['gwNum'].join(','), 
        			$stateParams.name.toUpperCase(), $scope.curPlay.toUpperCase(), 'QSW' , 99).then(function (res) {
        				var orders = [];
            			var summary = {
            				total: 0,
            				totalMoney: 0,
            			};
            			res['orderList'].forEach(function(order) {
            				orders.push({
            					number: order['cateName']+ ':' +order['number'],
            					pl: order['rate'],
            					xzje: $scope.data.quickOrderMoney,
            				});
            				summary['total'] += 1;
            				summary['totalMoney'] += $scope.data.quickOrderMoney*1;
            			});
            			
            			UI.openBetConfirmDialog(summary, orders, function () {
                			CPMisc.saveOrder($stateParams.name, CPMisc.GROUP_FLAG, [{
                				cateCode: 'QSW',
                				typeCode: $scope.curPlay.toUpperCase(),
                				token: res['token'],
                				xzje: $scope.data.quickOrderMoney
                			}]).then(function (res) {
                				if (typeof res['data'] == 'string') {
                    				UI.alert(res['data']['msg']);
                    			}
                    			else {
                    				UI.alert(res['data']['msg']);
                    			}
                    			// 重置
                    			$scope.fun.cancelOrder();
                			});
                		});
        			});
        },
        submitOrder: function () {
    		var orders = [];
        	var summary = {
        		total: 0,
        		totalMoney: 0
        	};
        	
        	if ($scope.curPlay.toLowerCase() == 'yzgg') {
        		return $scope.fun.yzggSubmitOrder();
        	}
        	else if ($scope.curPlay.toLowerCase() == 'zxs' || $scope.curPlay.toLowerCase() == 'zxl') {
        		return $scope.fun.zxSubmitOrder();
        	}
        	else if ($scope.curPlay.toLowerCase() == 'fszh') {
        		return $scope.fun.fsSubmitOrder();
        	}
        	
        	for (var id in $scope.data.betCode) {
        		summary.totalMoney += $scope.data.betCode[id]['xzje']*1;
        		summary.total += 1;
        		
        		orders.push({
        			number: $scope.fun.getPankouLabel(id) + ':' + $scope.data.betCode[id]['number'],
        			pl: $scope.data.betCode[id]['rate'],
        			xzje: $scope.data.betCode[id]['xzje']
        		});
        	}
        	
        	if (summary.totalMoney <= 0 || isNaN(summary.totalMoney)) {
    			UI.alert('下注金额最少为'+$scope.data.minBetMoney + '元');
    			return ;
    		}
        	
        	if (summary.total <= 0 ) {
        		UI.alert('至少选一个号码为一投注组合！');
        		return ;
        	}
        	
        	UI.openBetConfirmDialog(summary, orders, function () {
        		// 提交的flag 是？
            	var flag = CPMisc.NORMAL_FLAG;
            	
            	CPMisc.saveOrder($stateParams.name, flag, Object.values($scope.data.betCode))
            		.then(function (res) {
            			if (typeof res['data'] == 'string') {
            				UI.alert(res['data']['msg']);
            			}
            			else {
            				UI.alert(res['data']['msg']);
            			}
            			
            			// 重置
            			$scope.fun.cancelOrder();
            	});
        	}, function () {
        		$scope.fun.cancelOrder();
        	});
        },
        yzggPeiyuSelected: function (group, obj) {
        	$scope.data.betYzggPeiyuSelected[group] = obj['id'];
        },
    };
    
    // 封盘倒计时 回调
    $scope.fun.closeTickCb = function(leftSecond, intervalHandler) {
    	if (leftSecond <= 0) {
    		// 弹出封盘图层
    		$scope.data.fengpanMaskDialog = UI.openAlertMask('当前封盘中', false, '.hk6-game-play');
    	}
    };
    // 开奖倒计时回调
    $scope.fun.openTickCb = function (leftSecond, intervalHandler) {
    	if (leftSecond <= 0) {
    		// 弹出封盘图层
    		$scope.data.fengpanMaskDialog.close();
    		UI.openAlertMask('当前开奖中', false, '.hk6-game-play');
    		// 15s后重新获取数据
            $scope.data.kaiJiangMaskDialog = $timeout(function () {
            	$scope.data.kaiJIangMaskDialog.close();
            	getTopData();
            }, 15e3);
    	}
    };
     //球色
    $scope.topCircle = function(num){
        num = Number(num);
        var redArr = [1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49];
        var blueArr = [2,5,8,11,14,17,20,23,26,29,32,35,38,41,44,47,50];
        var greenArr = [0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48];
        if(redArr.indexOf(num)!=-1){
            return 'red';
        }
        if(greenArr.indexOf(num)!=-1){
            return 'green';
        }
        if(blueArr.indexOf(num)!=-1){
            return 'blue';
        }
    };
}]);