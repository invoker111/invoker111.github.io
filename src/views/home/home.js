import React from "react";
import {Link, Route, Switch} from "react-router-dom";
import Science from "../API/science/science";
import FrontNews from "../API/front-news/front-news";


class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            api: [
                {
                    name: '《science》',
                    url: '/api/science',
                    component: Science
                },
                {
                    name: '"前端"新闻',
                    url: '/api/front-news',
                    component: FrontNews
                }
            ]
        }
    }

    render() {
        return (
            <div className='the-home'>
                <span className='logo'>Information</span>
                <section className='select'>
                    {this.state.api.map((val)=>{
                        return (
                            <Link className='item' to={val.url} key={val.name}>
                                <span>{val.name}</span>
                            </Link>
                        )
                    })}
                </section>
                <section className='body'>
                    <Switch>
                        {this.state.api.map((val)=>{
                            const TheTag = val.component;
                            return (
                                <Route path={val.url} key={val.name}>
                                    <TheTag/>
                                </Route>
                            )
                        })}
                    </Switch>
                </section>
            </div>
        )
    }
}

export default Home
