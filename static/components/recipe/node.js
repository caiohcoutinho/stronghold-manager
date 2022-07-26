export default {
    name: 'Node',
    props: ['node_id', 'node_type', 'children', 'quantity', 'resource_id', 'count', 'showExcludeButton'],
    emits: ['changeStructure'],
    computed: {
        resources(){
            return this.$store.state.resources;
        },
        noChildren(){
            return _.isEmpty(this.children);
        },
        isInternNode(){
            return !_.isNull(this.node_type) && !_.isUndefined(this.node_type) && this.node_type != 'resource';
        }
    },
    methods: {
        addChild(){
            this.$emit('changeStructure', this.node_id+'|addChild');
        },
        removeNode(){
            this.$emit('changeStructure', this.node_id+'|removeChild');
        },
        changeNodeType(newValue){
            this.$emit('changeStructure', this.node_id+'|node_type='+newValue);
        },
        changeNodeQuantity(newValue){
            this.$emit('changeStructure', this.node_id+'|quantity='+newValue);
        },
        changeNodeResourceId(newValue){
            this.$emit('changeStructure', this.node_id+'|resource_id='+newValue);
        },
        bubbleUp(value){
            this.$emit('changeStructure', this.node_id+'|'+value);
        }
    },
    mounted: function(){
    },
    watch: {
    },
    template:
    `
        <table>
            <tr>
                <td v-if="showExcludeButton == 'true'">
                    <button type="button" class="btn btn-danger" @click="removeNode()">X</button>
                </td>
                <td>
                    <select class="form-select selectNodeType" :value="node_type"
                        @change="changeNodeType($event.target.value)">
                      <option value="null"></option>
                      <option value="and">And</option>
                      <option value="or">Or</option>
                      <option value="quantity">Quantity</option>
                      <option value="resource">Resource</option>
                    </select>
                </td>
                <td>
                    <button v-if="isInternNode"
                        type="button" class="btn btn-primary" @click="addChild()">+</button>
                    <span v-if="isInternNode && noChildren">Needs at least one child</span>
                </td>
                <td>
                    <input class="nodeQuantityNumber" :value="quantity" type="number" v-if="node_type == 'quantity'"
                        @change="changeNodeQuantity($event.target.value)"/>
                    <select v-if="node_type == 'resource'" class="form-select resourceSelect"
                        :value="resource_id" @change="changeNodeResourceId($event.target.value)">i
                      <option selected v-bind:value="null"></option>
                      <option v-for="resource in resources" v-bind:value="resource.id">{{resource.name}}</option>
                    </select>
                </td>
            </tr>
        </table>
        <table>
            <tr>
                <td class="col-md-1">
                </td>
                <td class="col-md-11">
                    <div class="nodeChildren" v-if="node_type != 'resource' && node_type != null">
                        <div v-for="(child, index) in children">
                            <Node @changeStructure="bubbleUp" :node_id="child.node_id" :node_type="child.node_type"
                                    :quantity="child.quantity" :resource_id="child.resource_id"
                                    :children="child.children" showExcludeButton="true"/>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    `
}