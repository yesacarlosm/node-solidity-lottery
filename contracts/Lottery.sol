//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.9;

contract Lottery {
    address private manager;
    address[] private players;
    
    constructor () {
        manager = msg.sender;
    }
    
    function getManager() public view returns(address) {
        return manager;
    }
    
    function getPlayers() public view returns(address[] memory) {
        return players;
    }
    
    //MODIFIERS
    modifier restricted() {
        require(msg.sender == manager, 'Only the address that deployed the contract is able to perform this.');
        _;
    }
    
    //PRIVATE
    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }
    
    //PUBLIC
    function enterLottery() public payable {
        require(msg.value > .01 ether, 'Need to send 0.01 ETH');
        players.push(msg.sender);
    }
    
    function pickWinner() public payable restricted returns (address) {
        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        address winner = players[index];
        players = new address[](0);
        return winner;
    }
    
}