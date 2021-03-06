import  React from  'react'
import PropTypes from 'prop-types';
import styles from './defaultStyle.css'
const defaultTopAbs=100,defaultTopFix=30,defaultLeft=100,defaultWidth=250;
class ArticleDirectory extends React.Component{
  constructor(props){
    super(props);
    this.state={
      directoryActive:'',
      directoryPos:'absolute',
      directoryList:[],
      sliding:false
    }
  }
  componentDidMount(){
    const topsAbs=this.props.style.topAbs||defaultTopAbs,
          topFix=this.props.style.topFix||defaultTopFix;
    const criticalValue=topsAbs-topFix;
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    this.setState({directoryPos:scrollTop>=criticalValue?'fixed':'absolute'});
    window.addEventListener('scroll',this.handleScroll);
    this.getDirectoryInfo()
  }
  componentWillReceiveProps(newProps){
      if(newProps.refresh!==this.props.refresh){
          this.getDirectoryInfo();
      }
  }
  componentWillUnmount(){
    window.removeEventListener('scroll',this.handleScroll)
  }
  getDirectoryInfo=()=>{
      const id=this.props.id;
      const offset=this.props.offset||0;
      const selector=this.props.selector||'h1';
      if(document.getElementById(id)){
          const directoryArr=document.getElementById(id).getElementsByTagName(selector);
          const directoryList=[];
          const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
          for (let i=0;i< directoryArr.length;i++){
              directoryList.push({label:directoryArr[i].innerText,scrollTop:parseInt(directoryArr[i].getBoundingClientRect().top+scrollTop-offset)});
          }
          this.setState({directoryList,directoryArr})
      }};
  handleScroll=()=>{
    const topsAbs=this.props.style.topAbs||defaultTopAbs,
          topFix=this.props.style.topFix||defaultTopFix;
    const criticalValue=topsAbs-topFix;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const directoryList=this.state.directoryList;

    //如果没有在滑动，则监听scrollTop改变当前的激活目录
    if(!this.state.sliding){
      let maxScrollTop=(document.body.scrollHeight||document.documentElement.scrollHeight)-
        (document.body.clientHeight||document.documentElement.clientHeight);
      let directoryActive=this.state.directoryActive;
      for(let i=0;i<directoryList.length;i++){
        if(scrollTop>=directoryList[i].scrollTop){
          directoryActive=i;
        }
      }
      if(scrollTop===maxScrollTop){
        directoryActive=directoryList.length-1;
      }
      this.setState({directoryActive});
    }
    this.setState({
      directoryPos:scrollTop>=criticalValue?'fixed':'absolute'
    })
  };
  slideToDirectory=(scrolltop,index)=>{
    if(this.state.sliding) return;

    this.setState({directoryActive:index,sliding:true});
    let maxTop=(document.body.scrollHeight||document.documentElement.scrollHeight)-(document.body.clientHeight||document.documentElement.clientHeight);
    const interVal=setInterval(()=>{
      let top= document.body.scrollTop||document.documentElement.scrollTop;
      let speed=scrolltop-top>0?Math.ceil((scrolltop-top)/12):Math.floor((scrolltop-top)/12);
      top+=speed;
      document.body.scrollTop=document.documentElement.scrollTop=top;
      if(top===scrolltop||top>=maxTop){
        this.setState({sliding:false});
        clearInterval(interVal)
      }
    },20)
  };
  render(){
    const containerStyle=this.props.style||{};
    const directoryStyle=this.props.itemStyle||{};
    const title=this.props.title||'Directory';
    const absStyle={
      position:'absolute',
      top:containerStyle.topAbs||defaultTopAbs,
      left:containerStyle.left||defaultLeft,
      width:containerStyle.width||defaultWidth
    };
    const fixStyle={
      position:'fixed',
      top:containerStyle.topFix||defaultTopFix,
      left:containerStyle.left||defaultLeft,
      width:containerStyle.width||defaultWidth
    };
    return (
      <ul
        style={this.state.directoryPos==='fixed'?{...fixStyle}:{...absStyle}}
        className="directory"
      >
        <li className='directoryTitle'>{title}</li>
        {this.state.directoryList.map((directory,index)=>{
          return <li
                     key={index}
                     style={{...directoryStyle}}
                     className={index===this.state.directoryActive?'directoryActive':''}
                     onClick={()=>{this.slideToDirectory(directory.scrollTop,index)}} >{directory.label}
                 </li>
        })}
      </ul>
    )
  }
}
ArticleDirectory.propTypes={
    id:PropTypes.string,
    selector:PropTypes.string,
    title:PropTypes.string,
    style:PropTypes.object,
    itemStyle:PropTypes.object,
    offset:PropTypes.number
}

export default ArticleDirectory
