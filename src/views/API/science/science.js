import React from "react";


class Science extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            pageNow: 1,
            pageCount: '',
            itemList: []
        }
    }

    async getPage (){
        let res = await fetch(
            `https://cors-anywhere.herokuapp.com/https://www.sciencemag.org/news/latest-news?page=${this.state.pageNow-1}`,
            {
                method: 'get'
            });
        if (res.status === 200){
            res.text().then(res=>{
                let html = document.createElement('html');
                html.innerHTML = res;
                let list = [];
                html.querySelectorAll('ul.headline-list > li').forEach(el=>{
                    let main = el.querySelector('.media__body h2>a');
                    let info = el.querySelector('.media__body p');
                    list.push({
                        title: main.innerText,
                        url: main.href,
                        author: info.querySelector('a').innerText,
                        time: info.querySelector('time').innerText,
                        summary: el.querySelector('.media__body div').innerText,
                        cover: el.querySelector('.media__icon img').src
                    });
                })
                this.setState({
                    itemList: list
                })
            })
        }
    }

    render() {
        return (
            <div className='api-science'>
                {this.state.itemList.map((val)=>{
                    return (
                        <div className='item' key={val.title}>
                            <img src={val.cover}/>
                        </div>
                    )
                })}
                <div onClick={()=>this.getPage()}>获取</div>
            </div>
        )
    }
}

export default Science
