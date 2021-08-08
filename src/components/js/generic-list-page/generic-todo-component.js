import React, {Component} from 'react';
import ReactDOM from "react-dom";
import { SORT_DIRECTION } from './generic-todo-store.js';
//import { BaseComponent } from '../core/base-component.js';


export class GenericlistComponent extends React.Component {
    listConfig = null;
    store = null;

    constructor(store) {
        super();
        this.store = store;
        this.store.refreshCb = this.refresh;
        this.listConfig = store.listConfig;
    }

    renderUl = () => {
        const bodyRows = this.store.getItems().map(item => this.renderBodyRow(item));
        const ulist = (<ul {this.listConfig.attributes}>{...bodyRows}</ul>);
        return ( <div className='list-container'>{ulist}</div> );
    }

    renderHeadRow = () => {
        const libox = this.listConfig.columns.map(column => {
            const ul = this.renderListHeadRow(column);
            return ul;
        });
        const actionLiBox = (<div className='enabling'>Actions</div>);
        const checkLiBox = (<div className='enabling'>Is Done</div>);
        return (<li>{checkLiBox, ...libox, actionLiBox}</li>);
    }

    renderBodyRow = (item) => {
        const libox = this.listConfig.columns.map(column => {
            const ul = this.renderUlLi(column.attributes, [column.getCellValue(item)]);
            return ul;
        });
        const deleteAction = ( <i className='fas fa-trash-alt' onClick={() => this.store.delete(item)}></i>);
        const actionLiBox = this.renderUlLi({}, [deleteAction]);
        return ( 
            <li onclick={() => this.store.setCurrentItem(item)}>
                {...libox, actionLiBox}
            </li>
        );
    }

    renderUlLi = (attributes, children) => {
        return (
            <div {attributes}>
                {children}
            </div>
        );
    }

    renderListHeadRow = (column) => {
        const [ASC] = SORT_DIRECTION;
        const children = (<span className='sorttext' {column.attributes}>column.label</span>);
        const [sortId, direction] = this.store.currentSort;
        if (column.sorter) {
            if (sortId === column.id) {
                if(direction === ASC){
                    const arrow = (<span className='sort-arrow'>↑</span>);
                }
                else{
                    const arrow = (<span className='sort-arrow'>↓</span>);
                }
                children.push(arrow);
            }
        }
        return (
            <div className='sorlist' {column.attributes} onClick ={() => this.store.setSort(column.id)}>
                {children} 
            </div>
        );
    }
 


    class renderForm extends Component{
        render(){
            const formFields = Object.keys(this.listConfig);
            const children = (<h3 className='title'>Let's Start Planning!</h3>);

            formFields.forEach(fieldAttributes => {
                let value = this.store.currentItem[fieldAttributes.name] || '';
                if (fieldAttributes.type === 'checkbox') {
                    fieldAttributes.checked = this.store.currentItem[fieldAttributes.name]
                } else if (fieldAttributes.type === 'datetime-local' && typeof value === 'string') {
                    value = value.substr(0, 16);
                }
                children.push( <imput {...fieldAttributes, value: value} /> );
            });

            children.push(
                <NewButton/>,
                <button className='buttons' type='button' onClick={()=>this.store.setCurrentItem()}>Cancel</button>,
                <input className='buttons' type='submit' value='Save'></input>,
                <renderSearchBar/>,
                <renderHeadRow/>
            )
            return(
                <div className='add-edit-form'>
                    <div className='titlebox'>
                        <h2 className='tittext'>
                            To do list
                        </h2>
                        <div className='todoicon'></div>
                    </div>
                    <form onsubmit={()=>this.store.onSubmit}>
                        <children>
                    </form>
                </div>
            );
        }
    };

    class renderSearchBar extends Component{
        render(){
            return(
                <div className='search-container'>
                    <h3 className='searchText'>Search for an existing plan:</h3>
                    <input className='searchbar' placeholder='search' value={this.store.searchTerm} onkeyup={this.store.onSearch}></input>
                </div>
            );
        }
    };

    class NewButton extends Component{
        render(){
            return(
                <div className='add-container'>
                    <button className='buttons' onClick = { () => this.store.setCurrentItem() }>New</button>
                </div>
            );
        }
    };

    render() {
        const children = [this.renderUl()];
        if (this.store.currentItem) {
            children.unshift(this.renderForm());
        }
        return ReactDOM.createPortal(
            this.renderElement(<div className='generic-list-page'>{children}</div>),
            domNode
        );
    }
}
