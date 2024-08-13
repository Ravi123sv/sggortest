const canvas = document.getElementById('pathCanvas');
const ctx = canvas.getContext('2d');
const contextMenu = document.getElementById('context-menu');
const explanationBox = document.getElementById('explanation');
const algorithmDropdown = document.getElementById('algorithmDropdown');
const pageTitle = document.getElementById('pageTitle');

let nodes = [];
let edges = [];
let addingEdge = false;
let edgeStartNode = null;
let selectedNode = null;
let selectedEdge = null;

pageTitle.addEventListener('click', () => {
    alert('Author: M.Ravi Sai Vinay');
});

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.node1.x, edge.node1.y);
        ctx.lineTo(edge.node2.x, edge.node2.y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        const midX = (edge.node1.x + edge.node2.x) / 2;
        const midY = (edge.node1.y + edge.node2.y) / 2;
        ctx.fillStyle = '#000';
        ctx.fillText(edge.weight, midX, midY);
    });

    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#007bff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fillText(node.label, node.x - 10, node.y + 5);
    });
}

function addNode(x, y) {
    const label = prompt('Enter label for the new node:');
    if (label) {
        nodes.push({ x, y, label });
        updateExplanation(`Node "${label}" added at (${x}, ${y}).`);
        drawGraph();
    }
}

function addEdge(node1, node2) {
    const weight = parseInt(prompt('Enter weight for the new edge:'), 10);
    if (!isNaN(weight)) {
        edges.push({ node1, node2, weight });
        updateExplanation(`Edge between "${node1.label}" and "${node2.label}" with weight ${weight} added.`);
        drawGraph();
    }
}

function updateExplanation(text) {
    explanationBox.innerText = text;
}

function getNodeAtPosition(x, y) {
    return nodes.find(node => Math.hypot(node.x - x, node.y - y) < 20);
}

function getEdgeAtPosition(x, y) {
    return edges.find(edge => {
        const { node1, node2 } = edge;
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const length = Math.hypot(dx, dy);
        const distance = Math.abs(dy * x - dx * y + node2.x * node1.y - node2.y * node1.x) / length;
        return distance < 10;
    });
}

function showContextMenu(x, y) {
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'block';
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
    selectedNode = null;
    selectedEdge = null;
}

function editItem() {
    if (selectedNode) {
        const newLabel = prompt('Enter new label for the node:', selectedNode.label);
        if (newLabel !== null) {
            selectedNode.label = newLabel;
            updateExplanation(`Node label updated to "${newLabel}".`);
            drawGraph();
        }
    } else if (selectedEdge) {
        const newWeight = parseInt(prompt('Enter new weight for the edge:', selectedEdge.weight), 10);
        if (!isNaN(newWeight)) {
            selectedEdge.weight = newWeight;
            updateExplanation(`Edge weight updated to ${newWeight}.`);
            drawGraph();
        }
    }
    hideContextMenu();
}

function connectItem() {
    if (selectedNode) {
        if (!addingEdge) {
            edgeStartNode = selectedNode;
            addingEdge = true;
            updateExplanation('Click on another node to create an edge.');
        } else {
            updateExplanation('Already adding an edge. Click on another node to complete the edge.');
        }
    }
    hideContextMenu();
}

function removeItem() {
    if (selectedNode) {
        edges = edges.filter(edge => edge.node1 !== selectedNode && edge.node2 !== selectedNode);
        nodes = nodes.filter(node => node !== selectedNode);
        updateExplanation(`Node "${selectedNode.label}" and its edges removed.`);
        drawGraph();
    } else if (selectedEdge) {
        edges = edges.filter(edge => edge !== selectedEdge);
        updateExplanation(`Edge between "${selectedEdge.node1.label}" and "${selectedEdge.node2.label}" removed.`);
        drawGraph();
    }
    hideContextMenu();
}

function startAlgorithm() {
    const algorithm = algorithmDropdown.value;
    if (nodes.length < 2) {
        updateExplanation('At least two nodes are required to run the algorithm.');
        return;
    }
    if (algorithm === 'dijkstra') {
        runDijkstra();
    } else if (algorithm === 'astar') {
        runAStar();
    } else if (algorithm === 'mst') {
        runMST();
    }
}

function runDijkstra() {
    const startNode = nodes[0];
    const distances = {};
    const previous = {};
    const unvisited = new Set(nodes);

    nodes.forEach(node => {
        distances[node.label] = Infinity;
        previous[node.label] = null;
    });
    distances[startNode.label] = 0;

    while (unvisited.size > 0) {
        const currentNode = [...unvisited].reduce((minNode, node) => 
            distances[node.label] < distances[minNode.label] ? node : minNode
        );
        unvisited.delete(currentNode);

        edges.forEach(edge => {
            if (edge.node1 === currentNode || edge.node2 === currentNode) {
                const neighbor = edge.node1 === currentNode ? edge.node2 : edge.node1;
                const alt = distances[currentNode.label] + edge.weight;
                if (alt < distances[neighbor.label]) {
                    distances[neighbor.label] = alt;
                    previous[neighbor.label] = currentNode;
                }
            }
        });
    }

    drawGraphWithShortestPaths(previous, startNode);
    updateExplanation('Dijkstra\'s Algorithm completed. Path distances are calculated.');
}

function runAStar() {
    // Placeholder for A* algorithm
    updateExplanation('A* Search Algorithm is not yet implemented.');
}

function runMST() {
    const edgesSorted = [...edges].sort((a, b) => a.weight - b.weight);
    const parent = {};
    const rank = {};

    nodes.forEach(node => {
        parent[node.label] = node.label;
        rank[node.label] = 0;
    });

    function find(node) {
        if (parent[node] !== node) {
            parent[node] = find(parent[node]);
        }
        return parent[node];
    }

    function union(node1, node2) {
        const root1 = find(node1);
        const root2 = find(node2);
        if (root1 !== root2) {
            if (rank[root1] > rank[root2]) {
                parent[root2] = root1;
            } else if (rank[root1] < rank[root2]) {
                parent[root2] = root2;
            } else {
                parent[root2] = root1;
                rank[root1]++;
            }
        }
    }

    const mstEdges = [];

    edgesSorted.forEach(edge => {
        const root1 = find(edge.node1.label);
        const root2 = find(edge.node2.label);
        if (root1 !== root2) {
            mstEdges.push(edge);
            union(edge.node1.label, edge.node2.label);
        }
    });

    drawGraphWithMST(mstEdges);
    updateExplanation('Minimum Spanning Tree (MST) completed.');
}

function drawGraphWithShortestPaths(previous, startNode) {
    const pathEdges = [];
    let node = nodes.find(n => n.label === Object.keys(previous).pop());

    while (previous[node.label]) {
        const edge = edges.find(e => 
            (e.node1 === node && e.node2 === previous[node.label]) ||
            (e.node2 === node && e.node1 === previous[node.label])
        );
        if (edge) pathEdges.push(edge);
        node = previous[node.label];
    }

    drawGraph();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    pathEdges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.node1.x, edge.node1.y);
        ctx.lineTo(edge.node2.x, edge.node2.y);
        ctx.stroke();
        ctx.closePath();
    });

    updateExplanation('Shortest path from start node highlighted.');
}

function drawGraphWithMST(mstEdges) {
    drawGraph();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 4;
    mstEdges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.node1.x, edge.node1.y);
        ctx.lineTo(edge.node2.x, edge.node2.y);
        ctx.stroke();
        ctx.closePath();
    });

    updateExplanation('Minimum Spanning Tree (MST) edges highlighted.');
}

canvas.addEventListener('click', (event) => {
    const { offsetX: x, offsetY: y } = event;
    if (addingEdge) {
        const node = getNodeAtPosition(x, y);
        if (node && edgeStartNode && edgeStartNode !== node) {
            addEdge(edgeStartNode, node);
            addingEdge = false;
            edgeStartNode = null;
        }
    } else {
        const node = getNodeAtPosition(x, y);
        if (node) {
            selectedNode = node;
            showContextMenu(x, y);
        } else {
            addNode(x, y);
        }
    }
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const { offsetX: x, offsetY: y } = event;
    const node = getNodeAtPosition(x, y);
    const edge = getEdgeAtPosition(x, y);
    selectedNode = node;
    selectedEdge = edge;
    if (node || edge) {
        showContextMenu(x, y);
    } else {
        hideContextMenu();
    }
});

document.addEventListener('click', (event) => {
    if (!contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});