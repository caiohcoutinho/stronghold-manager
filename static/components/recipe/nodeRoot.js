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
                    current.children.push({node_id:current.count++, count: 0});
                } else if(instruction.startsWith('removeChild')){
                    previous.children.splice(_.findIndex(previous.children, (c) => {return c.node_id == current.node_id}), 1);
                } else if(instruction.startsWith('nodeType')){
                    current.nodeType = instruction.substring('nodeType='.length);
                } else if(instruction.startsWith('quantity')){
                    current.quantity = instruction.substring('quantity='.length);
                } else if(instruction.startsWith('resourceId')){
                    current.resourceId = instruction.substring('resourceId='.length);
                }
            }
            this.$emit('updateStructure', structure);
        }
    },
    template:
    `
        <Node v-if="structure != null" :node_id="structure.node_id" @changeStructure="updateStructure($event)" :nodeType="structure.nodeType"
               :quantity="structure.quantity" :resourceId="structure.resourceId"
               :children="structure.children" :count="structure.count" showExcludeButton="false"/>
    `
}