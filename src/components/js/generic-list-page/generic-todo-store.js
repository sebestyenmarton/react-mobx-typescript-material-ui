function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0; 
      let v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
}

export const SORT_DIRECTION = ['ASC', 'DESC'];

export class GenericlistStore {
    forceUpdate = null;           // function
    listConfig = null;         // list config
    currentItem = null;         // current item for add and edit
    sorlistColumns = [];       // which columns should be sorted
    currentSort = [];           // [id, direction]
    searchTerm = '';            // search term
    items = [];                 // unfiltred items
    
    constructor(listConfig) {
        this.listConfig = listConfig;
        this.currentItem = new listConfig.model();
        this.init();
    }

    init() {
        const firstSorlistColumn = this.listConfig.columns.find(x => x.sorter);
        if (firstSorlistColumn) {
            this.setSort(firstSorlistColumn.id);
        }
        this.getList();
        
    }

    // --- CRUD method: get/created/update/delete ---
    get = async (id) => {
        const Model = this.listConfig.model;
        const request = await fetch(this.listConfig.endpoint + id);
        const item = await request.json();
        const mappedItem = new Model(item);
        return mappedItem;
    }   

    getList = async () => {
        const Model = this.listConfig.model;
        const request = await fetch(this.listConfig.endpoint);
        const items = await request.json();
        const mappedItems = items.map(x => new Model(x));
        this.setItems(mappedItems);
        return mappedItems;
    }    

    create = async (data) => {
        data.id = guid();
        const Model = this.listConfig.model;
        const item = new Model(data);
        const request = await fetch(this.listConfig.endpoint, { 
            method: 'POST', 
            body: JSON.stringify(item),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        const savedItem = await request.json();
        const mappedItem = new Model(savedItem);
        this.setItems([mappedItem, ...this.items]);
        return mappedItem;
    }

    update = async  (data) => {
        const Model = this.listConfig.model;
        const request = await fetch(this.listConfig.endpoint + data.id, { 
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }
        });
        const updatedItem = await request.json();
        const mappedItem = new Model(updatedItem);
        this.setItems(this.items.map(item => item.id === data.id ? mappedItem : item));
        return mappedItem;
    }

    delete = async (deletedItem) => {
        await fetch(this.listConfig.endpoint + deletedItem.id, { method: 'DELETE' });
        this.setItems(this.items.filter(item => item.id !== deletedItem.id));
    }

    getItems() {
        if (!this.searchTerm) { return this.items; }
        return this.items.filter(item => this.listConfig.searchFilter(this.searchTerm, item));
    }

    setItems(items) {
        this.items = items;
        if (this.forceUpdate) {
            this.forceUpdate();
        }
    }

    setCurrentItem(currentItem) {
        if (typeof currentItem === 'undefined') {
            const Model = this.listConfig.model;
            currentItem = new Model();
        }
        this.currentItem = currentItem;
        if (this.forceUpdate) {
            this.forceUpdate();
        }
    }

    onChangeCurrentItem = (event) => {
        const elem = event.currentTarget;
        if (!elem.name) { 
            return console.error('Element doesn\'t have name attribute');
        }
        let value = elem.value;
        if (elem.type === 'checkbox') {
            value = elem.checked;
        } else if (elem.type === 'datetime-local') {
            value = new Date(value).toISOString();
        }
        this.currentItem[elem.name] = value;
        this.setCurrentItem(this.currentItem);
    }
    
    setSort = (id) => {
        const [ASC, DESC] = SORT_DIRECTION;
        const [currentId, direction] = this.currentSort;
        this.currentSort = [id, id === currentId && direction === ASC ? DESC : ASC];
        const column = this.listConfig.columns.find(c => c.id === id);
        const sortedItems = this.items.sort((user1, user2) => column.sorter(user1, user2) * (this.currentSort[1] === DESC ? -1 : 1))
        this.setItems(sortedItems);
    }

    onSearch = (event) => {
        if (event.key !== "Enter") { return; }
        this.searchTerm = event.target.value.trim();
        if (this.forceUpdate) {
            this.forceUpdate();
        }
    }

    onSubmit = (event) => {  
        event.preventDefault();
        event.stopPropagation();
        const inputList = Array.from(event.target.querySelectorAll(`input[name]`));
        const formData = inputList.reduce((data, inputElem) => {
            let value = inputElem.value;
            if (inputElem.type === 'checkbox') {
                value = inputElem.checked;
            } else if (inputElem.type === 'datetime-local') {
                value = new Date(value).toISOString();
            }
            data[inputElem.name] = value;
            return data;
        }, {});
        const data = Object.assign(this.currentItem, this.listConfig.beforeFormSubmit(formData));
        event.target.reset();
        if (data.id) {
            this.update(data);
        } else {
            this.create(data);
        }
        this.setCurrentItem();
        return false;
    }
}
