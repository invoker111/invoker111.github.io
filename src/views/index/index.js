import React from "react";
import './index.scss'
import Footer from "../block/footer/footer";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Home from "@/views/home/home";
import About from "@/views/about/about";

class Index extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router className='the-index' history={window.history}>
                <Switch>
                    <Route path='/'>
                        <Home/>
                    </Route>
                    <Route path='/about'>
                        <About/>
                    </Route>
                </Switch>
                <Footer/>
            </Router>
        )
    }
}

export default Index;