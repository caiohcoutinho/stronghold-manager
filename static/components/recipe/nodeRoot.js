import Node from './node.js'

export default {
    props: ['structure'],
    emits: ['updateStructure'],
    components: {
        Node
    },
    methods:{
        updateStructure(change){
            let instructions = change.split("|");
            let count = 0;

            let previous = null;
            let structure = JSON.parse(JSON.stringify(this.structure));
            let current = structure;
            while(!_.isEmpty(instructions) && count++ < 1000){
                let instruction = instructions.shift();
                let node_id = (+instruction);
                if(instruction == 'Root'){
                    // Nothing to do here
                } else if(_.isNumber(node_id) && !_.isNaN(node_id)){
                    let next = _.findWhere(current.children, {node_id: node_id});
                    previous = current;
                    current = next;
                } else if(instruction.startsWith('addChild')){
                    if(!_.has(current, 'children')){
                        current.children = [];
                    }
                    if(!_.has(current, 'count')){
                        current.count = 0;
                    }
                    current.children.push({node_id:current.count++, count: 0});
                } else if(instruction.startsWith('removeChild')){
                    previous.children.splice(_.findIndex(previous.children, (c) => {return c.node_id == current.node_id}), 1);
                } else if(instruction.startsWith('node_type')){
                    current.node_type = instruction.substring('node_type='.length);
                } else if(instruction.startsWith('quantity')){
                    current.quantity = instruction.substring('quantity='.length);
                } else if(instruction.startsWith('resource_id')){
                    current.resource_id = instruction.substring('resource_id='.length);
                }
            }
            this.$emit('updateStructure', structure);
        }
    },
    template:
    `
        <Node v-if="structure != null" :node_id="structure.node_id" @changeStructure="updateStructure($event)" :node_type="structure.node_type"
               :quantity="structure.quantity" :resource_id="structure.resource_id"
               :children="structure.children" :count="structure.count" showExcludeButton="false"/>
    `
}