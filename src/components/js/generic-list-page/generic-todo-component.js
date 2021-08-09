import React, { Component } from 'react';
import { SORT_DIRECTION } from './generic-todo-store.js';

export class GenericlistComponent extends Component {
    listConfig = null;
    store = null;

    componentDidMount() {
        this.store = this.props.store;
        this.listConfig = this.store.listConfig;
        console.log(this.store);
        const s = this;
        this.store.forceUpdate = function() {
            s.forceUpdate();
        }
    }

    renderUl = () => {
        const bodyRows = this.store.getItems().map(item => this.renderBodyRow(item));
        const ulist = (<ul {...this.listConfig.attributes}>{bodyRows}</ul>);
        return ( <div className='list-container'>{ulist}</div> );
    }

    renderHeadRow = () => {
        const libox = this.listConfig.columns.map(column => {
            const ul = this.renderListHeadRow(column);
            return ul;
        });
        const actionLiBox = (<div className='enabling'>Actions</div>);
        const checkLiBox = (<div className='enabling'>Is Done</div>);
        return (<li>{[checkLiBox, ...libox, actionLiBox]}</li>);
    }

    renderBodyRow = (item) => {

        const libox = this.listConfig.columns.map(column => (<div {...column.attributes}> {column.getCellValue(item)} </div>));
        const deleteAction = ( <i className='fas fa-trash-alt' onClick={() => this.store.delete(item)}></i>);
        const actionLiBox = ( <div> {deleteAction} </div>);
        return ( 
            <li onClick={() => this.store.setCurrentItem(item)}>
                {[...libox, actionLiBox]}
            </li>
        );
    }

    renderListHeadRow = (column) => {
        const [ASC] = SORT_DIRECTION;
        const children = [<span className='sorttext' {...column.attributes}>{column.label}</span>];
        const [sortId, direction] = this.store.currentSort;
        if (column.sorter) {
            if (sortId === column.id) {
                children.push(<span className='sort-arrow'>{direction === ASC ? '↓' : '↑'}</span>);
            }
        }
        return (
            <div className='sorlist' {...column.attributes} onClick ={() => this.store.setSort(column.id)}>
                {children} 
            </div>
        );
    }
 
    renderForm() {
        const formFields = this.listConfig.formFields;
        const children = [
            <h3 className='title'>Let's Start Planning!</h3>
        ];

        formFields.forEach(fieldAttributes => {
            let value = this.store.currentItem[fieldAttributes.name] || '';
            if (fieldAttributes.type === 'checkbox') {
                fieldAttributes.checked = this.store.currentItem[fieldAttributes.name]
            } else if (fieldAttributes.type === 'datetime-local' && typeof value === 'string') {
                value = value.substr(0, 16);
            }
            children.push( <input {...fieldAttributes} onChange={this.store.onChangeCurrentItem} value={value} /> );
        });

        children.push(
            this.renderNewButton(),
            <button className='buttons' type='button' onClick={() => this.store.setCurrentItem()}>Cancel</button>,
            <input className='buttons' type='submit' value='Save' />,
            this.renderSearchBar(),
            this.renderHeadRow()
        );

        return (
            <div className='add-edit-form'>
                <div className='titlebox'>
                    <h2 className='tittext'>
                        To do list
                    </h2>
                    <div className='todoicon'></div>
                </div>
                <form onSubmit={this.store.onSubmit}>
                    {children}
                </form>
            </div>
        );
    };

    renderSearchBar() {
        return (
            <div className='search-container'>
                <h3 className='searchText'>Search for an existing plan:</h3>
                <input className='searchbar' placeholder='search' value={this.store.searchTerm} onkeyup={this.store.onSearch}></input>
            </div>
        );
    };

    renderNewButton() {
        return (
            <div className='add-container'>
                <button className='buttons' onClick = {() => this.store.setCurrentItem()}>New</button>
            </div>
        );
    };

    render() {
        if (!this.store) { return null; }
        const children = [
            this.renderUl()
        ];
        if (this.store.currentItem) {
            children.unshift(this.renderForm());
        }
        return (
            <div className='generic-list-page'>{children}</div>
        );
    }
}
